import { useEffect, useState } from "react";
// import axios from "axios";
import type { AttendanceRecord } from "../../Kedatangan/type";

interface Activity {
  type: "attendance" | "cerapan" | "quiz" | "rph";
  message: string;
  date: string;
}

export default function Dashboard() {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    // const [attendanceRate, setAttendanceRate] = useState<number>(0);
    // const [cerapanCount, setCerapanCount] = useState<number>(0);
    // const [rphCount, setRphCount] = useState<number>(0);
    // const [quizGenerated, setQuizGenerated] = useState<number>(0);
    // const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

  return (
    <div>
      <h2>📊 Kedatangan</h2>
      <table>
        <thead>
          <tr>
            <th>Nama</th>
            <th>Role</th>
            <th>Login Time</th>
            <th>IP Address</th>
            <th>SSID</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>{r.role}</td>
              <td>{new Date(r.loginTime).toLocaleString()}</td>
              <td>{r.ipAddress}</td>
              <td>{r.wifiSSID}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
