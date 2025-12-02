import { useCallback, useState } from "react";
import { useQuizHistory } from "./useQuizHistory";
import { processQuestions } from "../../../utils/quizUtils";
const ArrayOf = Array.isArray;
interface GenerationPayload {
    topic?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    questionCount?: number;
    numQuestions?: number;
    // Flashcard specific fields
    subject?: string;
    year?: string;
    // Video Quiz specific fields
    // url?: string;
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

    // 确定目标 API URL，默认为 generateApiUrl，如果未提供则使用 Quiz 的路径
    const apiUrl = generateApiUrl || "/api/quiz/generate"; 

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiBody: any = {
        questionCount: payload.numQuestions ?? payload.questionCount ?? 5,
        topic : payload.topic,
        difficulty : payload.difficulty,
    };
        
    // if (apiUrl.includes('video-quiz')) {
    //     // Video Quiz (GenerateVideoQuizDto) 只需要 url 和 questionCount
    //     if (!payload.url) throw new Error("URL diperlukan untuk kuiz video.");
    //     apiBody = {
    //         url: payload.url,
    //         questionCount: apiBody.questionCount,
    //     };
    //     // ⚠️ 故意不包含 topic 和 difficulty
    // } else {
    //     // Flashcard/Topic Quiz Generate 需要 topic 和 difficulty
    //     apiBody.topic = payload.topic;
    //     apiBody.difficulty = payload.difficulty;
    // }

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiBody),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Generation failed: Status ${res.status}. ${errorText.substring(0, 100)}...`);
      }
      const processedData = await res.json();
      // const isVideoQuiz = apiUrl.includes('video-quiz');
      const isFlashcard = apiUrl.includes('flashcards');
      
      let historyType: 'flashcard' | 'quiz-topic' = 'quiz-topic';

      // 🚨 Video Quiz 逻辑：注入 ID/Index
      // if (isVideoQuiz && processedData.questions) {
      //     processedData.questions = processQuestions(processedData.questions);
      //     historyType = 'quiz-video';
      // } else if (isFlashcard && processedData.flashcards) {
      //     historyType = 'flashcard';
      // } else if (processedData.questions) {
      //     processedData.questions = processQuestions(processedData.questions);
      //     historyType = 'quiz-topic';
      // }
      if (isFlashcard && processedData.flashcards) {
        historyType = 'flashcard';
      } else if (processedData.questions) {
      // Topic Quiz 逻辑：注入 ID/Index
        processedData.questions = processQuestions(processedData.questions);
      }
      
      setData(processedData); 
      
      // ----------------------------------------------------
      // 历史记录保存逻辑 (Flashcard)
      // ----------------------------------------------------
      
      if (historyType !== 'quiz-topic') { // 仅保存 Flashcard 的历史记录
        const content = processedData.flashcards;
        const snapshotData = {
          title: `Kad Imbas: ${payload.topic}`,
          subject: payload.subject || "N/A",
          difficulty: payload.difficulty || "medium",
          flashcards: content,
        };
                
        await fetch("/api/quiz/history", {
          method: "POST",
          eaders: { "Content-Type": "application/json" },
          body: JSON.stringify({
            generatedBy: 'flashcard-generator',
            note: `Generated via ${historyType}`,
            snapshot: JSON.stringify(snapshotData),
            contentType: historyType, 
          }),
         });
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
  // 2. 生成并保存方法 (用于 Topic Quiz - 保持不变)
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
          questionCount:
            payload.numQuestions ?? payload.questionCount ?? 5,
        }),
      });

      if (!genRes.ok) throw new Error("Generate failed");
      const genJson = await genRes.json();

      const rawQuestions = ArrayOf(genJson.questions)
      ? genJson.questions
      : [];

      // ⭐ 使用辅助函数注入 ID/Index
      const questions = processQuestions(rawQuestions);

      // 2) Build Quiz Object
      const quizToSave = {
        title:
          genJson.title ||
          `${payload.subject || "Kuiz"} — ${payload.topic || "Topik"}`,
        subject: payload.subject || "Unknown",
        difficulty: payload.difficulty || "medium",
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
