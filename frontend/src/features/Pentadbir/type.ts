export type DashboardStats = {
  totalUsers: number;
  totalTeachers: number;
  totalCerapan: number;
  pendingReviews: number;
};

export type KedatanganStats = {
  totalTeachers: number;
  presentToday: number;
  lateToday: number;
  absentToday: number;
  attendanceRate: number;
};

export type CerapanOverview = {
  totalCerapan: number;
  completed: number;
  pending: number;
};

// Template Rubrik types
export interface ScoreDescription {
  score: number;
  label: string;
  description: string;
}

export interface RubricItem {
  id: string;
  text: string;
  maxScore: number;
  scoreDescriptions?: ScoreDescription[];
}

export interface RubricSubCategory {
  id: string;
  code: string;
  name: string;
  description: string;
  items: RubricItem[];
}

export interface RubricCategory {
  id: string;
  code: string;
  name: string;
  description: string;
  subCategories: RubricSubCategory[];
}

export interface TemplateRubric {
  id: string;
  name: string;
  description: string;
  scaleSkor: number;
  categories: RubricCategory[];
  createdAt: string;
  updatedAt: string;
}
