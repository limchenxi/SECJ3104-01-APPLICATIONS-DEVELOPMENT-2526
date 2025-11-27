export type QuizDifficulty = "easy" | "medium" | "hard";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  correctAnswer: string;
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