// Question snapshot from template
export interface QuestionSnapshot {
  questionId: string;
  text: string;
}

// Answer structure for self-evaluation
export interface SelfEvaluationAnswer {
  questionId: string;
  answer: string;
}

// Mark structure for admin observations
export interface AdminMark {
  questionId: string;
  mark: number;
  comment: string;
}

// Observation section (self-eval, obs1, obs2)
export interface ObservationSection {
  status: 'pending' | 'submitted';
  submittedAt?: Date;
  answers?: SelfEvaluationAnswer[];
  marks?: AdminMark[];
  administratorId?: string;
}

// Main Cerapan Record
export interface CerapanRecord {
  _id: string;
  teacherId: string;
  period: string;
  subject: string;
  class: string;
  templateId: string;
  status: string;
  questions_snapshot: QuestionSnapshot[];
  self_evaluation: ObservationSection;
  observation_1: ObservationSection;
  observation_2: ObservationSection;
  createdAt?: string;
  updatedAt?: string;
}

// DTO for starting evaluation (Teacher selects subject/class)
export interface StartEvaluationDto {
  teacherId: string;
  templateId: string;
  period: string;
  subject: string;
  class: string;
}

// DTO for submitting self-evaluation
export interface SubmitSelfEvalDto {
  answers: {
    questionId: string;
    answer: string;
  }[];
}

// DTO for admin submitting observations
export interface SubmitObservationDto {
  marks: {
    questionId: string;
    mark: number;
    comment: string;
  }[];
}

// Legacy types (keeping for backward compatibility)
export interface CerapanFormValues {
  teacherName: string;
  observerName: string;
  lessonTopic: string;
  strengths: string;
  improvements: string;
  score: number;
}
