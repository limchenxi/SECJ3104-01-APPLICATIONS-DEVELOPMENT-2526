import { backendClient } from "../../../utils/axios-client";
import type { QuizGenerationRequest, QuizGenerationResponse, QuizHistory } from "../type";

export const generateQuiz = async (
  payload: QuizGenerationRequest,
): Promise<QuizGenerationResponse> => {
  const client = backendClient();
  const response = await client.post<QuizGenerationResponse>(
    "/quiz/generate",
    payload,
  );
  return response.data;
};

const client = backendClient();

export const getQuizHistory = async (): Promise<QuizHistory[]> => {
  const res = await client.get("/quiz/history");
  return res.data;
};

export const getQuizHistoryById = async (id: string): Promise<QuizHistory> => {
  const res = await client.get(`/quiz/history/${id}`);
  return res.data;
};

export const saveQuizHistory = async (payload: Partial<QuizHistory>): Promise<QuizHistory> => {
  const res = await client.post("/quiz/history", payload);
  return res.data;
};
