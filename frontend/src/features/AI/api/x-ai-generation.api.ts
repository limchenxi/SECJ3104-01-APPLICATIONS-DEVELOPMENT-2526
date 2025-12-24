// import { backendClient } from "../../../utils/axios-client";
// import type { AIGeneratedItem, AIGenerationRequest } from "../type";

// const client = () => backendClient();

/**
 * 调用 AI 模型生成内容
 */
// export const generateAIContent = async (
//   payload: AIGenerationRequest
// ): Promise<AIGeneratedItem> => {
//   const response = await client().post("/ai/run", payload);
//   return response.data;
// };

/**
 * 获取所有 AI 模块（例如 Lesson Plan, Quiz Generation）
 */
// List generated content
// export const listGeneratedContent = async (): Promise<AIGeneratedItem[]> => {
//   const response = await client().get("/ai/generated");
//   return response.data;
// };

// Create or update AI Module
// export const createAIModule = async (payload: any) => {
//   return client().post("/ai/modules", payload);
// };