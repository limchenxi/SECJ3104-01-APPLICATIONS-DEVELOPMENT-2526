import { backendClient } from "../../../utils/axios-client";
import type { AIGeneratedItem, AIGenerationRequest } from "../type";

const client = () => backendClient();

export const generateAIContent = async (
  payload: AIGenerationRequest,
): Promise<AIGeneratedItem> => {
  const response = await client().post<AIGeneratedItem>("/ai/modules", payload);
  return response.data;
};

export const listGeneratedContent = async (): Promise<AIGeneratedItem[]> => {
  const response = await client().get<AIGeneratedItem[]>("/ai/modules");
  return response.data;
};
