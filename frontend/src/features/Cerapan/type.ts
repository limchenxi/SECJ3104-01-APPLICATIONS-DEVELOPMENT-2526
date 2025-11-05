export interface CerapanFormValues {
  teacherName: string;
  observerName: string;
  lessonTopic: string;
  strengths: string;
  improvements: string;
  score: number;
}

export interface CerapanRecord extends CerapanFormValues {
  id: string;
  createdAt: string;
}
