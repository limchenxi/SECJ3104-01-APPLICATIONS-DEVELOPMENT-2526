import { useCallback, useState } from "react";
import { useQuizHistory } from "./useQuizHistory";
import { processQuestions } from "../../../utils/quizUtils";
import { backendClient } from "../../../utils/axios-client";
const ArrayOf = Array.isArray;
interface GenerationPayload {
    topic?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    questionCount?: number;
    numQuestions?: number;
    subject?: string;
    year?: string;
}

export function useGenerateQuiz(generateApiUrl?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any | null>(null);
  const { reload } = useQuizHistory({ pollInterval: 0 }); 
  // ----------------------------------------------------
  // 1. 通用生成方法 (用于 Flashcards)
  // ----------------------------------------------------
  async function generate(payload: GenerationPayload) {
    setLoading(true);
    setError(null);
    setData(null);

    const client = backendClient();
  const apiUrl = generateApiUrl || "/quiz/generate";

    // const apiUrl = generateApiUrl || "/api/quiz/generate"; 

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiBody: any = {
        questionCount: payload.numQuestions ?? payload.questionCount ?? 5,
        topic : payload.topic,
        difficulty : payload.difficulty,
        year: payload.year,
        subject: payload.subject,
    };

    try {
      const res = await client.post(apiUrl, apiBody);
      const processedData = res.data;
      // const res = await fetch(apiUrl, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(apiBody),
      // });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Generation failed: Status ${res.status}. ${errorText.substring(0, 100)}...`);
      }
      // const processedData = await res.json();
      const isFlashcard = apiUrl.includes('flashcards');
      
      let historyType: 'flashcard' | 'quiz-topic' = 'quiz-topic';

      if (isFlashcard && processedData.flashcards) {
        historyType = 'flashcard';
      } else if (processedData.questions) {
      // Topic Quiz 逻辑：注入 ID/Index
        processedData.questions = processQuestions(processedData.questions);
      }
      
      setData(processedData); 
      
      // History (Flashcard)
      // ----------------------------------------------------
      
      if (historyType !== 'quiz-topic') { 
        const content = isFlashcard ? processedData.flashcards : processedData.questions;
        const snapshotData = {
          title: `Kad Imbas: ${payload.topic}`,
          topic: payload.topic,
          subject: payload.subject || "N/A",
          difficulty: payload.difficulty || "medium",
          year: payload.year,
          flashcards: content,
        };
        try { 
          const histRes = await client.post("/quiz/history", {
            generatedBy: isFlashcard ? 'flashcard-generator' : 'topic-quiz-generator',
            note: `Generated via ${historyType}`,
            snapshot: JSON.stringify(snapshotData),
            contentType: historyType,
          });
          // const histRes = await fetch("/api/quiz/history", {
          //   method: "POST",
          //   headers: { "Content-Type": "application/json" },
          //   body: JSON.stringify({
          //     generatedBy: isFlashcard ? 'flashcard-generator' : 'topic-quiz-generator',
          //     note: `Generated via ${historyType}`,
          //     snapshot: JSON.stringify(snapshotData),
          //     contentType: historyType, 
          //   }),
          // });
                    
          if (!histRes.ok) {
            const errorText = await histRes.text();
            console.error('❌ History Save Failed:', histRes.status, errorText);
          }
        } catch (histErr) {
           console.error('❌ History Fetch Error:', histErr);
        }
        reload(); 
      }
            
    } catch (err: any) {
        setError(err?.message || String(err));
        console.error("GENERATE HOOK ERROR:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }
  
  // ----------------------------------------------------
  // 2. 生成并保存方法 (Topic Quiz)
  // ----------------------------------------------------
  async function generateAndSave(payload: GenerationPayload, generatedBy = "web-user") {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      // 1) Generate quiz using AI
      const genRes = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: payload.topic,
          difficulty: payload.difficulty,
          year: payload.year,
          subject: payload.subject,
          questionCount:
            payload.numQuestions ?? payload.questionCount ?? 5,
        }),
      });

      if (!genRes.ok) throw new Error("Generate failed");
      const genJson = await genRes.json();

      const rawQuestions = ArrayOf(genJson.questions)
      ? genJson.questions
      : [];

      const questions = processQuestions(rawQuestions);

      // 2) Build Quiz Object
      const quizToSave = {
        title:
          genJson.title ||
          `${payload.subject || "Kuiz"} — ${payload.topic || "Topik"}`,
        subject: payload.subject || "Unknown",
        difficulty: payload.difficulty || "medium",
        year: payload.year,
        questions,
        createdBy: generatedBy,
      };

      // 3) Save quiz to DB
      const saveRes = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quizToSave),
      });

      const text = await saveRes.text();
      console.log("SAVE QUIZ:", text);

      if (!saveRes.ok) throw new Error(`Failed to save quiz: Status ${saveRes.status}, Body: ${text.substring(0, 100)}...`)

      const savedQuiz = JSON.parse(text);

      // 4) Save History Snapshot
      const snapshot = JSON.stringify({
        title: quizToSave.title,
        topic: payload.topic,
        year: payload.year,
        subject: quizToSave.subject,
        difficulty: quizToSave.difficulty,
        questions,
      });

      await fetch("/api/quiz/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: savedQuiz._id,
          generatedBy,
          snapshot,
          note: `Generated ${new Date().toISOString()}`,
          contentType: "quiz-topic",
        }),
      });
      reload(); 

      setData(savedQuiz);
      return savedQuiz;
    } catch (err: any) {
      setError(err?.message || String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, data, generate, generateAndSave };
}
