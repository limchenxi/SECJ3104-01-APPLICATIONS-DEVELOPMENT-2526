import { setAuthToken } from "../../../utils/auth";
import { backendClient } from "../../../utils/axios-client";
import type { Profile } from "../../Profile/type";

export const authService = {
  login: async (email: string, password: string) => {
    const client = backendClient({ withAuth: false });
    const res = await client.post<{
      token: string;
      user: {
        name: string;
        role: "GURU" | "PENTADBIR" | "SUPERADMIN";
      };
    }>("/auth/login", { email, password });
    setAuthToken(res.data.token);
    return res.data;
  },
  logout: () => {
    setAuthToken(null);
  },
  getProfile: async () => {
    const client = backendClient();
    const res = await client.get<Profile>("/auth/me");
    return res.data;
  },
};
