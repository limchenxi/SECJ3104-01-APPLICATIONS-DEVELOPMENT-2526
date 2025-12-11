import { backendClient } from "../../../utils/axios-client";

export type AvailableCerapanAssignment = {
  subject: string;
  class: string;
}

export type TeachingAssignment = {
  _id: string;
  teacherId: string;
  subject: string;
  class: string;
  // Removed academicYear and term
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateTeachingAssignmentPayload = {
  teacherId: string;
  subject: string;
  class: string;
  // Removed academicYear and term
  active?: boolean;
}

export type UpdateTeachingAssignmentPayload = Partial<CreateTeachingAssignmentPayload>;

export const TeachingAssignmentAPI = {
  getAll: async (): Promise<TeachingAssignment[]> => {
    const res = await backendClient().get<TeachingAssignment[]>("/teaching-assignments");
    return res.data;
  },

  getByTeacher: async (teacherId: string): Promise<TeachingAssignment[]> => {
    const res = await backendClient().get<TeachingAssignment[]>(
      "/teaching-assignments",
      { params: { teacherId } }
    );
    return res.data;
  },

  getAvailableForCerapan: async (period: string): Promise<AvailableCerapanAssignment[]> => {
    const res = await backendClient().get<AvailableCerapanAssignment[]>(
      "/teaching-assignments/me/available-for-cerapan",
      { params: { period } }
    );
    return res.data;
  },

  create: async (payload: CreateTeachingAssignmentPayload): Promise<TeachingAssignment> => {
    // Remove academicYear and term from payload before sending
    const { academicYear, term, ...rest } = payload as any;
    const res = await backendClient().post<TeachingAssignment>("/teaching-assignments", rest);
    return res.data;
  },

  update: async (id: string, payload: UpdateTeachingAssignmentPayload): Promise<TeachingAssignment> => {
    // Remove academicYear and term from payload before sending
    const { academicYear, term, ...rest } = payload as any;
    const res = await backendClient().patch<TeachingAssignment>(`/teaching-assignments/${id}`, rest);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await backendClient().delete(`/teaching-assignments/${id}`);
  },
};

