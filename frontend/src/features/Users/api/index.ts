import { backendClient } from "../../../utils/axios-client";
import type { UserItem } from "../stores";

const client = () => backendClient();
const basePath = "/users";

export interface CreateUserPayload {
  name: string;
  email: string;
  role?: string;
  password?: string;
}

export type UpdateUserPayload = Partial<CreateUserPayload>;

export const userApi = {
  getAll: async (): Promise<UserItem[]> => {
    const response = await client().get<UserItem[]>(basePath);
    return response.data;
  },

  getById: async (id: string | number): Promise<UserItem> => {
    const response = await client().get<UserItem>(`${basePath}/${id}`);
    return response.data;
  },

  create: async (userData: CreateUserPayload): Promise<UserItem> => {
    const response = await client().post<UserItem>(basePath, userData);
    return response.data;
  },

  update: async (
    id: string | number,
    userData: UpdateUserPayload,
  ): Promise<UserItem> => {
    const response = await client().patch<UserItem>(
      `${basePath}/${id}`,
      userData,
    );
    return response.data;
  },

  delete: async (id: string | number): Promise<void> => {
    await client().delete(`${basePath}/${id}`);
  },
};
