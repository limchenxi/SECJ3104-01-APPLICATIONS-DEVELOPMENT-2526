import { useQuery } from "@tanstack/react-query";
import { getQuizHistoryById } from "../api/quizService";

export const useQuizHistoryById = (id: string) => {
  return useQuery({
    queryKey: ["quiz-history", id],
    queryFn: () => getQuizHistoryById(id),
    enabled: !!id,
  });
};
