import { useCallback, useState } from "react";
import { useQuizHistory } from "./useQuizHistory";
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
    url?: string;
}

export function useGenerateQuiz(generateApiUrl?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any | null>(null);
  const { reload } = useQuizHistory({ pollInterval: 0 }); 

  const processQuestions = useCallback((rawQuestions: any[]) => {
        if (!ArrayOf(rawQuestions)) return [];

        return rawQuestions.map((q: any, idx: number) => {
            const questionId = q.id || `${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 9)}`;
            const answerText = q.correctAnswer || q.answer; 
            const answerIndex = q.options.findIndex((opt: string) => opt === answerText);

            return {
                id: questionId,
                question: q.question,
                options: q.options,
                answerIndex: answerIndex >= 0 ? answerIndex : 0, 
                answer: answerText || "",
                explanation: q.explanation || "",
            };
        });
    }, []); // 依赖数组为空，因此只创建一次

  // ----------------------------------------------------
  // 1. 通用生成方法 (用于 Flashcards, Video Quiz - 不保存)
  // ----------------------------------------------------
  async function generate(payload: GenerationPayload) {
    setLoading(true);
    setError(null);
    setData(null);

    // 确定目标 API URL，默认为 generateApiUrl，如果未提供则使用 Quiz 的路径
    const apiUrl = generateApiUrl || "/api/quiz/generate"; 

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: payload.url, // 传递 URL (如果存在)
          topic: payload.topic,
          difficulty: payload.difficulty,
          // 使用 numQuestions 或 questionCount 字段，取决于后端预期
          questionCount: payload.numQuestions ?? payload.questionCount ?? 5,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Generation failed: Status ${res.status}. ${errorText.substring(0, 100)}...`);
      }
      const processedData = await res.json();
      const isVideoQuiz = apiUrl.includes('video-quiz');
      const isFlashcard = apiUrl.includes('flashcards');
      
      let historyType: 'quiz-video' | 'flashcard' | 'unknown' = 'unknown';

      // 🚨 Video Quiz 逻辑：注入 ID/Index
      if (isVideoQuiz && processedData.questions) {
          processedData.questions = processQuestions(processedData.questions);
          historyType = 'quiz-video';
      } else if (isFlashcard && processedData.flashcards) {
          historyType = 'flashcard';
      }
      
      setData(processedData); 
      
      // ----------------------------------------------------
      // 历史记录保存逻辑 (Video Quiz & Flashcard)
      // ----------------------------------------------------
      if (historyType !== 'unknown') {
          const content = isFlashcard ? processedData.flashcards : processedData.questions;
          const snapshotData = {
              title: isVideoQuiz ? `Kuiz Video: ${payload.url}` : "Kad Imbas Dijana",
              subject: payload.subject || (isVideoQuiz ? "Video Content" : "N/A"),
              difficulty: payload.difficulty || "medium",
              questions: isVideoQuiz ? content : undefined, 
              flashcards: isFlashcard ? content : undefined,
          };
          
          await fetch("/api/quiz/history", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  generatedBy: isVideoQuiz ? 'video-quiz-generator' : 'flashcard-generator',
                  note: `Generated via ${historyType}`,
                  snapshot: JSON.stringify(snapshotData),
                  contentType: historyType, 
              }),
          });
          reload(); // 刷新历史记录
      }

      return processedData;
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

      // ⭐ 转换步骤：从答案文本找到索引
      // const questions = rawQuestions.map((q: any, idx: number) => {
      //     // 确保每个问题都有一个唯一的ID
      //     const questionId = q.id || `${Date.now()}-${idx}`;
          
      //     const answerText = q.correctAnswer || q.answer; 
          
      //     // 找到正确答案在 options 数组中的9index
      //     const answerIndex = q.options.findIndex((opt: string) => opt === answerText);

      //     return {
      //         id: questionId,
      //         question: q.question,
      //         options: q.options,
      //         answerIndex: answerIndex >= 0 ? answerIndex : 0, // 默认值为0
      //         answer: answerText || "",
      //         explanation: q.explanation || "",
      //     };
      // });

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
