import { backendClient } from "../../../utils/axios-client";

const client = () => backendClient();

export interface AIUsageRecord {
  _id: string;
  module: string;
  model: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  tokensUsed?: number;
}


export const getAIUsageAnalytics = async (): Promise<AIUsageRecord[]> => {
  const res = await client().get<AIUsageRecord[]>("/ai/usage");
  return res.data;
};

export const getAIUsageStats = async () => {
  const res = await client().get("/ai/usage/stats");
  return res.data;
};

export const getAIUsageByModule = async (module: string) => {
  const res = await client().get(`/ai/usage/module/${module}`);
  return res.data;
};
