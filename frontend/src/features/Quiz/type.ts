export type QuizDifficulty = "easy" | "medium" | "hard";

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

export interface Quiz {
  _id?: string;
  title: string;
  subject: string;
  difficulty: QuizDifficulty;
  duration: number;
  questions: QuizQuestion[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuizHistory {
  _id?: string;
  quizId: string;
  generatedBy: string;
  note?: string;
  snapshot?: string;
  createdAt?: string;
  updatedAt?: string;
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