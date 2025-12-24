import { backendClient } from "../../../utils/axios-client";
import type { CreateUserPayload, UpdateUserPayload, UserItem } from "../type";

const client = () => backendClient();
const basePath = "/users";

export const userApi = {
  getAll: async (): Promise<UserItem[]> => {
    const response = await client().get<UserItem[]>(basePath);
    return response.data;
  },

  getMyAssignments: async (): Promise<{ subjects: string[]; classes: string[] }> => {
    const response = await client().get<{ subjects: string[]; classes: string[] }>(`${basePath}/me/assignments`);
    return response.data;
  },

  getById: async (id: string | number): Promise<UserItem> => {
    const response = await client().get<UserItem>(`${basePath}/${id}`);
    return response.data;
  },

  getMe: async (): Promise<UserItem> => {
    const response = await client().get<UserItem>(`${basePath}/me`);
    return response.data;
  },

  create: async (userData: CreateUserPayload): Promise<UserItem> => {
    const response = await client().post<UserItem>(basePath, userData);
    const createdUser = response.data;
    return { ...createdUser, id: createdUser._id || createdUser.id };
  },

  update: async (
    id: string | number,
    userData: UpdateUserPayload,
  ): Promise<UserItem> => {
    const response = await client().patch<UserItem>(
      `${basePath}/${id}`,
      userData,
    );
    const updatedUser = response.data;
    return { ...updatedUser, id: updatedUser._id || updatedUser.id };
  },

  delete: async (id: string | number): Promise<void> => {
    await client().delete(`${basePath}/${id}`);
  },
};
