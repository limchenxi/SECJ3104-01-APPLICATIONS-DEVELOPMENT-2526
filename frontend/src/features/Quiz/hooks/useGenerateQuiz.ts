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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiBody: any = {
      questionCount: payload.numQuestions ?? payload.questionCount ?? 5,
      topic: payload.topic,
      difficulty: payload.difficulty,
      year: payload.year,
      subject: payload.subject,
    };

    try {
      const res = await client.post(apiUrl, apiBody);
      const processedData = res.data;

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

          if (histRes.status !== 201 && histRes.status !== 200) {
            console.error('❌ History Save Failed:', histRes.status, histRes.data);
          }
        } catch (histErr) {
          console.error('❌ History Fetch Error:', histErr);
        }
        reload();
      }

    } catch (err: any) {
      // Axios error handling
      const msg = err.response?.data?.message || err.message || String(err);
      setError(msg);
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
    const client = backendClient();

    try {
      // 1) Generate quiz using AI
      const genRes = await client.post("/quiz/generate", {
        topic: payload.topic,
        difficulty: payload.difficulty,
        year: payload.year,
        subject: payload.subject,
        questionCount:
          payload.numQuestions ?? payload.questionCount ?? 5,
      });

      const genJson = genRes.data;

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
      const saveRes = await client.post("/quiz", quizToSave);

      const savedQuiz = saveRes.data;
      console.log("SAVE QUIZ:", savedQuiz);

      // 4) Save History Snapshot
      const snapshot = JSON.stringify({
        title: quizToSave.title,
        topic: payload.topic,
        year: payload.year,
        subject: quizToSave.subject,
        difficulty: quizToSave.difficulty,
        questions,
      });

      await client.post("/quiz/history", {
        quizId: savedQuiz._id,
        generatedBy,
        snapshot,
        note: `Generated ${new Date().toISOString()}`,
        contentType: "quiz-topic",
      });
      reload();

      setData(savedQuiz);
      return savedQuiz;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || String(err);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, data, generate, generateAndSave };
}
