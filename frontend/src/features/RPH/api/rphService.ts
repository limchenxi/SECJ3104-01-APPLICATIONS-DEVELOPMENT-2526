import { backendClient } from "../../../utils/axios-client";

export interface RPHRequest {
  subject: string;
  level: string;
  objectives: string;
}

export interface RPHResponse {
  title: string;
  body: string;
  generatedAt: string;
}

export const generateRPH = async (
  payload: RPHRequest,
): Promise<RPHResponse> => {
  const client = backendClient();
  const response = await client.post<RPHResponse>("/rph/generate", payload);
  return response.data;
};
