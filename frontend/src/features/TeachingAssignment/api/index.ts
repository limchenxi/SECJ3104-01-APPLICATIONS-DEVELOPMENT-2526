import { backendClient } from "../../../utils/axios-client";
import type { TeachingAssignment } from "../type";

export const TeachingAssignmentAPI = {
  getAll: async () => {
    const res = await backendClient().get<TeachingAssignment[]>("/teaching-assignments");
    return res.data;
  },

  getByTeacher: async (teacherId: string) => {
    const res = await backendClient().get<TeachingAssignment[]>(
      `/teaching-assignments/teacher/${teacherId}`
    );
    return res.data;
  },

  create: async (payload: {
    teacherId: string;
    classId: string;
    subjectId: string;
  }) => {
    const res = await backendClient().post("/teaching-assignments", payload);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await backendClient().delete(`/teaching-assignments/${id}`);
    return res.data;
  },
};
