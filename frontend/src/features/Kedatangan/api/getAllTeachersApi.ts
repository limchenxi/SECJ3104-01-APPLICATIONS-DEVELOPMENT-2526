import { backendClient } from "../../../utils/axios-client";

export async function getAllTeachers() {
  const client = backendClient();
  const res = await client.get("/users");
  // Filter for teachers (role: GURU in array)
  return res.data.filter((user: any) => Array.isArray(user.role) && user.role.includes("GURU"));
}
