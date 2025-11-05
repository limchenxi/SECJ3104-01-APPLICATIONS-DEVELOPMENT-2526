import { backendClient } from "../../../utils/axios-client";
import type { AttendanceRecord } from "../type";

const client = () => backendClient();

export const getAttendance = async (): Promise<AttendanceRecord[]> => {
  const response = await client().get<AttendanceRecord[]>("/attendance");
  return response.data;
};

export const recordAttendance = async (
  data: Partial<AttendanceRecord>,
): Promise<AttendanceRecord> => {
  const response = await client().post<AttendanceRecord>("/attendance", data);
  return response.data;
};
