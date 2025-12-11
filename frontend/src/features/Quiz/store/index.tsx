import { backendClient } from "../../../utils/axios-client";
import type { QuizHistory } from "../type";

const client = backendClient();
// export const useGenerateQuiz = () => {
//   return useMutation<QuizGenerationResponse, Error, QuizGenerationRequest>({
//     mutationFn: (payload) => generateQuiz(payload),
//   });
// };

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
