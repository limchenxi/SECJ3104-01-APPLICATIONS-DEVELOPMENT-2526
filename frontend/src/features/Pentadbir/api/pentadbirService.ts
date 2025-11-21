import { backendClient } from "../../../utils/axios-client";
import type { DashboardStats, KedatanganStats, CerapanOverview } from "../type";

interface TemplateRubric {
  _id: string;
  name: string;
  version: string;
  categories: any[];
}

interface CerapanEvaluation {
  _id: string;
  teacherId: string;
  period: string;
  subject: string;
  class: string;
  status: string;
  self_evaluation: {
    status: string;
    submittedAt?: Date;
  };
  observation_1: {
    status: string;
    submittedAt?: Date;
  };
  observation_2: {
    status: string;
    submittedAt?: Date;
  };
  createdAt: Date;
  scheduledDate?: string;
  scheduledTime?: string;
  observerName?: string;
  templateRubric?: string;
  notes?: string;
  observationType?: string;
}

export const pentadbirService = {
  getDashboard: async (): Promise<DashboardStats> => {
    const client = backendClient();
    const res = await client.get<DashboardStats>("/pentadbir/dashboard");
    return res.data;
  },

  getKedatanganStats: async (): Promise<KedatanganStats> => {
    const client = backendClient();
    const res = await client.get<KedatanganStats>("/pentadbir/kedatangan/stats");
    return res.data;
  },

  getCerapanOverview: async (): Promise<CerapanOverview> => {
    const client = backendClient();
    const res = await client.get<CerapanOverview>("/pentadbir/cerapan/overview");
    return res.data;
  },

  getTemplateRubrics: async (): Promise<TemplateRubric[]> => {
    const client = backendClient();
    const res = await client.get<TemplateRubric[]>("/pentadbir/templates");
    return res.data;
  },

  getAllEvaluations: async (): Promise<CerapanEvaluation[]> => {
    const client = backendClient();
    const res = await client.get<CerapanEvaluation[]>("/cerapan/admin/all-evaluations");
    return res.data;
  },

  getEvaluationSummary: async (evaluationId: string) => {
    const client = backendClient();
    const res = await client.get(`/cerapan/admin/report/${evaluationId}/summary`);
    return res.data;
  },

  updateSchedule: async (evaluationId: string, scheduleData: {
    scheduledDate: string;
    scheduledTime: string;
    observerName: string;
    templateRubric: string;
    notes?: string;
    observationType: string;
  }) => {
    const client = backendClient();
    const res = await client.put(`/cerapan/schedule/${evaluationId}`, scheduleData);
    return res.data;
  },
};

export type { CerapanEvaluation };
