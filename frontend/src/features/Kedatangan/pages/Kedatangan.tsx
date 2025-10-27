import { useEffect, useState } from "react";
import { getAttendance } from "../../services/attendanceService";
import { AttendanceRecord } from "../../types/attendance";
import AttendanceTable from "./components/AttendanceTable";
import { Typography, Container } from "@mui/material";

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  //pentadbir
  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>([]);
  const [searchTeacher, setSearchTeacher] = useState<string>("");


  useEffect(() => {
    getAttendance().then(setRecords);
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Attendance Records
      </Typography>
      <AttendanceTable data={records} />
    </Container>
  );
}
