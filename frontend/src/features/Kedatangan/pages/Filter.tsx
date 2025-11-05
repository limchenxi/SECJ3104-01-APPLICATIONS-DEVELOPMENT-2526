import { Box, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import type { ChangeEvent } from "react";

export interface AttendanceFilterValue {
  status: "all" | "present" | "absent" | "late";
  search: string;
}

interface AttendanceFilterProps {
  value: AttendanceFilterValue;
  onChange: (value: AttendanceFilterValue) => void;
}

const statuses: AttendanceFilterValue["status"][] = [
  "all",
  "present",
  "absent",
  "late",
];

export default function AttendanceFilter({
  value,
  onChange,
}: AttendanceFilterProps) {
  const handleStatusChange = (event: SelectChangeEvent) => {
    onChange({
      ...value,
      status: event.target.value as AttendanceFilterValue["status"],
    });
  };

  const handleSearchChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    onChange({ ...value, search: event.target.value });
  };

  return (
    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
      <FormControl sx={{ minWidth: 160 }}>
        <InputLabel id="attendance-status-label">Status</InputLabel>
        <Select
          labelId="attendance-status-label"
          value={value.status}
          label="Status"
          onChange={handleStatusChange}
          size="small"
        >
          {statuses.map((status) => (
            <MenuItem key={status} value={status}>
              {status === "all" ? "Semua" : status}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        value={value.search}
        onChange={handleSearchChange}
        placeholder="Cari mengikut nama..."
        size="small"
      />
    </Box>
  );
}
