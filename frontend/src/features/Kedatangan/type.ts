export interface AttendanceRecord {
  id: number;
  name: string;
  role: string;
  status: "present" | "absent" | "late";
  loginTime: string;
  date: string;
  ipAddress: string;
  wifiSSID: string;
}
