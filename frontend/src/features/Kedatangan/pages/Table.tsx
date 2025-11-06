import { Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import type { AttendanceRecord } from "../type";

interface Props {
  data: AttendanceRecord[];
}

export default function AttendanceTable({ data }: Props) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Role</TableCell>
          <TableCell>Login Time</TableCell>
          <TableCell>IP Address</TableCell>
          <TableCell>WiFi SSID</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((record) => (
          <TableRow key={record.id}>
            <TableCell>{record.name}</TableCell>
            <TableCell>{record.role}</TableCell>
            <TableCell>{new Date(record.loginTime).toLocaleString()}</TableCell>
            <TableCell>{record.ipAddress}</TableCell>
            <TableCell>{record.wifiSSID}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
