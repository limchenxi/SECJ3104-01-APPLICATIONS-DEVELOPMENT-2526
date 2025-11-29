import { backendClient } from "../../../utils/axios-client";
import type { AIModule } from "../type";

const client = () => backendClient();

// list modules
export const listAIModules = async (): Promise<AIModule[]> => {
  const res = await client().get("/ai/modules");
  return res.data;
};

// create module
export const createAIModule = async (data: AIModule) => {
  const res = await client().post("/ai/modules", data);
  return res.data;
};

// update module
export const updateAIModule = async (id: string, data: Partial<AIModule>) => {
  const res = await client().put(`/ai/modules/${id}`, data);
  return res.data;
};

// delete module
export const deleteAIModule = async (id: string) => {
  const res = await client().delete(`/ai/modules/${id}`);
  return res.data;
};
