import { backendClient } from "../../../utils/axios-client";

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
