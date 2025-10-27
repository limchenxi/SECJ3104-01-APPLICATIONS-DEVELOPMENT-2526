import apiClient from "@/services/apiClient";

export const getMyCerapan = async () => {
  const res = await apiClient.get("/cerapan/me");
  return res.data;
};
