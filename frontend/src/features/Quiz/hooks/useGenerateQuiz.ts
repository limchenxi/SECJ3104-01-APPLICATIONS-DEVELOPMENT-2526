import { useState } from "react";

/**
 * payload: { topic, difficulty, questionCount, subject?, year? } (与你后端 DTO 对齐)
 *
 * Backend expectations:
 * POST /quiz/generate  -> returns { questions: [...], generatedAt, title? }
 * POST /quiz           -> create quiz, returns saved quiz with _id
 * POST /quiz/history   -> save history, body { quizId, generatedBy, snapshot, note? }
 */
export function useGenerateQuiz() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any | null>(null);

  async function generateAndSave(payload: any, generatedBy = "web-user") {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      // 1) Ask AI to generate quiz
      const genRes = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: payload.topic,
          difficulty: payload.difficulty,
          questionCount: payload.numQuestions ?? payload.questionCount ?? 5,
        }),
      });
      if (!genRes.ok) throw new Error("Generate failed");
      const genJson = await genRes.json();
      const questions = genJson.questions || genJson.quiz || genJson.questions;

      // build quiz object to save
      const quizToSave = {
        title:
          genJson.title ||
          `${payload.subject || "Kuiz"} — ${payload.topic || "Topik"}`,
        subject: payload.subject || "Unknown",
        difficulty: payload.difficulty || "medium",
        questions,
        createdBy: generatedBy,
      };

      // 2) Save quiz to DB
      const saveRes = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quizToSave),
      });
      if (!saveRes.ok) throw new Error("Failed to save quiz");
      const savedQuiz = await saveRes.json();

      // 3) Create history snapshot (store snapshot JSON string)
      const snapshot = JSON.stringify({ quiz: questions, meta: quizToSave });
      const histRes = await fetch("/api/quiz/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: savedQuiz._id,
          generatedBy,
          snapshot,
          note: `Generated ${new Date().toISOString()}`,
        }),
      });
      if (!histRes.ok) {
        // non-fatal: history can fail but we still return saved quiz
        console.warn("Warning: failed to save quiz history");
      }

      setData(savedQuiz);
      return savedQuiz;
    } catch (err: any) {
      console.error("useGenerateQuiz error", err);
      setError(err?.message || String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, data, generateAndSave };
}
