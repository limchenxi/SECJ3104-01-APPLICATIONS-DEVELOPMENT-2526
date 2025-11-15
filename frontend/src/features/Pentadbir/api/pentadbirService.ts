import { backendClient } from "../../../utils/axios-client";
import type { DashboardStats, KedatanganStats, CerapanOverview } from "../type";

interface TemplateRubric {
  _id: string;
  name: string;
  version: string;
  categories: any[];
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
};
