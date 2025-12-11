// Score description from template
export interface ScoreDescription {
  score: number; // 0-4
  label: string; // e.g., "Cemerlang", "Baik"
  description: string; // Criteria text
}

// Question snapshot from template
export interface QuestionSnapshot {
  questionId: string;
  text: string;
  maxScore: number;
  scoreDescriptions?: ScoreDescription[]; // Array of score 0-4 descriptions
  // Optional rubric codes for grouping by section (e.g., 4.1.1)
  categoryCode?: string;
  subCategoryCode?: string;
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
  aiComment?: string;
}

// Computed summary structures returned by /cerapan/report/:id/summary
export interface ReportSummary {
  meta: {
    items: number;
    maxTotal: number;
    scale: number;
  };
  selfEvaluation: {
    answered: number;
    completionPercent: number;
    status: string;
    submittedAt: string | null;
  };
  observation1: {
    total: number;
    maxTotal: number;
    percent: number;
    avgPerItem: number;
    count: number;
    status: string;
    submittedAt: string | null;
  };
  observation2: {
    total: number;
    maxTotal: number;
    percent: number;
    avgPerItem: number;
    count: number;
    status: string;
    submittedAt: string | null;
  };
  categories: {
    breakdown: Array<{
      code: string;
      fullMark: number;
      achievedSelf: number;
      percentSelf: number;
      score10_Self: number;
      achieved1: number;
      percent1: number;
      score10_1: number;
      achieved2: number;
      percent2: number;
      score10_2: number;
    }>;
    totals: {
      selfScore10Sum: number;
      observation1Score10Sum: number;
      observation2Score10Sum: number;
      selfRawAchieved: number;
      observation1RawAchieved: number;
      observation2RawAchieved: number;
      fullMarkSum: number;
      selfPercent: number;
      observation1Percent: number;
      observation2Percent: number;
    };
  };
  overall: {
    percent: number;
    avgScore: number;
    label: string;
  };
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
    comment?: string;
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
