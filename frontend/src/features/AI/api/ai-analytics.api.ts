import { backendClient } from "../../../utils/axios-client";
import type { AIUsage } from "../type";

const client = () => backendClient();


export const getAIUsageAnalytics = async (): Promise<AIUsage[]> => {
  const res = await client().get<AIUsage[]>("/ai/usage");
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

export const getAIUsageByType = async (type: string): Promise<AIUsage[]> => {
  const res = await client().get<AIUsage[]>(`/ai/usage?module=${type}`); 
  return res.data;
};
