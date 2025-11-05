import { backendClient } from "../../../utils/axios-client";

export interface SummaryStat {
  label: string;
  value: number;
  trend?: number;
}

export interface ActivityItem {
  id: string;
  type: "attendance" | "cerapan" | "quiz" | "rph";
  message: string;
  timestamp: string;
}

const client = () => backendClient();

export const getSummaryStats = async (): Promise<SummaryStat[]> => {
  const response = await client().get<SummaryStat[]>("/dashboard/summary");
  return response.data;
};

export const getRecentActivities = async (): Promise<ActivityItem[]> => {
  const response = await client().get<ActivityItem[]>("/dashboard/activities");
  return response.data;
};
