export type QuizDifficulty = "easy" | "medium" | "hard";

export interface QuizQuestion {
  id: string;
  _id?: string;
  question: string;
  options: string[];
  answerIndex: number;
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

export interface Flashcard {
  id: string;
  front: string; 
  back: string;  
}