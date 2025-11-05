import { backendClient } from "../../../utils/axios-client";

export type QuizDifficulty = "easy" | "medium" | "hard";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
}

export interface QuizGenerationRequest {
  topic: string;
  difficulty: QuizDifficulty;
  questionCount: number;
}

export interface QuizGenerationResponse {
  questions: QuizQuestion[];
  generatedAt: string;
}

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
