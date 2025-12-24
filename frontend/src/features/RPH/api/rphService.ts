import { backendClient } from "../../../utils/axios-client";
import type { RPHRequest, RPHResponse } from "../type";

export const generateRPH = async (
  payload: RPHRequest,
): Promise<RPHResponse> => {
  const client = backendClient();
  const response = await client.post<RPHResponse>("/rph/generate", payload);
  return response.data;
};

export const rphApi = {
  getHistory: async () => {
    const client = backendClient();
    const response = await client.get('/rph');
    return response.data;
  },
};
