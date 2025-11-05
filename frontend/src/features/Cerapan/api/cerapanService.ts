import { backendClient } from "../../../utils/axios-client";
import type { CerapanRecord } from "../type";

const client = () => backendClient();

export const getMyCerapan = async (): Promise<CerapanRecord[]> => {
  const response = await client().get<CerapanRecord[]>("/cerapan/me");
  return response.data;
};

export const createCerapan = async (
  payload: Omit<CerapanRecord, "id" | "createdAt">,
): Promise<CerapanRecord> => {
  const response = await client().post<CerapanRecord>("/cerapan", payload);
  return response.data;
};
