export type ObservationType = 'Cerapan 1' | 'Cerapan 2';
export type ScheduleStatus = 'Belum Dijadualkan' | 'Dijadualkan' | 'Selesai';

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  email: string;
}

export interface ObservationSchedule {
  id: string;
  evaluationId?: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  class: string;
  observationType: ObservationType | null;
  scheduledDate: string | null;
  scheduledTime: string | null;
  observerName: string;
  templateRubric: string;
  notes: string;
  status: ScheduleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleFormData {
  observationType: ObservationType;
  scheduledDate: string;
  scheduledTime: string;
  subject: string;
  class: string;
  observerName: string;
  templateRubric: string;
  notes: string;
}
