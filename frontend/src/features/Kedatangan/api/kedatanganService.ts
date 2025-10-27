import axios from "axios";
import { AttendanceRecord } from "../types";

const API_URL = "http://localhost:5000/api/attendance"; 

export const getAttendance = async (): Promise<AttendanceRecord[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};

// export const recordAttendance = async (data: Partial<AttendanceRecord>) => {
//   const response = await axios.post(API_URL, data);
//   return response.data;
// };
export const recordAttendance = async (data: any) => {
  try {
    const response = await axios.post(API_URL, data);
    return response.data;
  } catch (error) {
    console.error("打卡失败:", error);
    throw error;
  }
};

// export const getMyAttendance = () => api.get("/attendance/me");
// export const recordAttendance = (data: any) => api.post("/attendance/record", data);