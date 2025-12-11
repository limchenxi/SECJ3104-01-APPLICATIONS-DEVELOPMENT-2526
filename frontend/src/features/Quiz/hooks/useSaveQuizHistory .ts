import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveQuizHistory } from "../api/quizService";

export const useSaveQuizHistory = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: saveQuizHistory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quiz-history"] });
    },
  });
};
