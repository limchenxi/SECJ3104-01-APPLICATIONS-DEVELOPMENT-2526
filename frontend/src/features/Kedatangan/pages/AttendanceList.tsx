import { useState, useMemo, useEffect, type JSX } from "react";
import {
  Box, Card, Typography, List, ListItem,
  ListItemAvatar, ListItemText, Avatar, Chip, TextField,
  Divider, ButtonGroup, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, MenuItem,
  Select, FormControl, InputLabel, Grid, ListSubheader, CircularProgress
} from "@mui/material";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import AddIcon from "@mui/icons-material/Add";

import { useAdminAttendance } from "../../../hooks/useAdminAttendance";
import { getAllTeachers } from "../api/getAllTeachersApi";

type StatusFilter = "all" | "present" | "absent" | "late";

const FILTERS: { label: string, value: StatusFilter }[] = [
  { label: "SEMUA", value: "all" },
  { label: "HADIR", value: "present" },
  { label: "TIDAK HADIR", value: "absent" },
  { label: "LEWAT", value: "late" },
];

export default function StaffActivityFeed(): JSX.Element {
  // 1. --- HOOK INTEGRATION ---
  const { globalHistory, fetchDashboardFeed, submitManualRecord, loading } = useAdminAttendance();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRange, setSelectedRange] = useState("today");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [open, setOpen] = useState(false);


  const [manualEntry, setManualEntry] = useState({
    teacherId: "",
    date: new Date().toISOString().split('T')[0],
    timeIn: "08:00",
    timeOut: "16:00"
  });

  const [teachers, setTeachers] = useState<any[]>([]);

  useEffect(() => {
    // Fetch teachers for manual entry dropdown
    getAllTeachers().then(setTeachers).catch(() => setTeachers([]));
  }, []);

  // 2. --- DATA FETCHING EFFECT ---
  useEffect(() => {
    // Calculate start/end dates based on selectedRange
    const end = new Date().toISOString().split('T')[0];
    const start = new Date();
    if (selectedRange === "7d") start.setDate(start.getDate() - 7);
    else if (selectedRange === "30d") start.setDate(start.getDate() - 30);

    fetchDashboardFeed(start.toISOString().split('T')[0], end);
  }, [selectedRange, fetchDashboardFeed]);

  // 3. --- REAL SUBMISSION LOGIC ---
  const handleManualSubmit = async () => {
    // Construct the payload exactly as the NestJS DTO expects
    const payload = {
      userID: manualEntry.teacherId,
      date: new Date(manualEntry.date).toISOString(),
      clockInTime: new Date(`${manualEntry.date}T${manualEntry.timeIn}:00`).toISOString(),
      clockOutTime: new Date(`${manualEntry.date}T${manualEntry.timeOut}:00`).toISOString(),
    };

    try {
      await submitManualRecord(payload);
      setOpen(false);
      // Refresh the feed
      const today = new Date().toISOString().split('T')[0];
      fetchDashboardFeed(today, today);
    } catch (err) {
      console.error("Failed to save manual record", err);
    }
  };

  // 4. --- UPDATED GROUPING LOGIC ---
  // Now uses 'globalHistory' from the backend instead of local 'logs' state
  const groupedLogs = useMemo(() => {
    const groups: Record<string, any[]> = {};

    globalHistory.forEach(record => {
      // Use attendanceDate (normalized to midnight UTC) as the key
      const d = new Date(record.attendanceDate);
      const dateStr = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).toDateString();
      if (!groups[dateStr]) groups[dateStr] = [];

      // Split the record into "In" and "Out" for the feed display
      if (record.timeIn) {
        groups[dateStr].push({
          ...record,
          id: `${record._id}-in`,
          action: 'in',
          displayTime: new Date(record.timeIn),
          teacherName: record.userName,
        });
      }
      if (record.timeOut) {
        groups[dateStr].push({
          ...record,
          id: `${record._id}-out`,
          action: 'out',
          displayTime: new Date(record.timeOut),
          teacherName: record.userName,
        });
      }
      // Handle Absent records
      if (record.attendanceType === 'TIDAK HADIR') {
        groups[dateStr].push({
          ...record,
          id: `${record._id}-absent`,
          action: 'absent',
          isAbsentVirtual: true,
          displayTime: new Date(record.attendanceDate),
        });
      }
    });

    // Filtering logic
    Object.keys(groups).forEach(date => {
      groups[date] = groups[date].filter(item => {
        const matchesSearch = item.userName?.toLowerCase().includes(searchTerm.toLowerCase());
        let matchesStatus = true;
        if (statusFilter === "present") matchesStatus = item.action === "in" && item.attendanceType !== "LEWAT";
        if (statusFilter === "late") matchesStatus = item.attendanceType === "LEWAT" && item.action === "in";
        if (statusFilter === "absent") matchesStatus = item.attendanceType === "TIDAK HADIR";
        if (statusFilter === "all") matchesStatus = true;
        return matchesSearch && matchesStatus;
      }).sort((a, b) => b.displayTime.getTime() - a.displayTime.getTime());
    });

    return groups;
  }, [globalHistory, searchTerm, statusFilter]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#eceff1", p: { xs: 2, md: 4 } }}>
      <Box maxWidth="900px" mx="auto">

        {/* Header Section */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h5" fontWeight={800} color="primary.dark">Rekod Kedatangan</Typography>
            <ButtonGroup variant="outlined" size="small" sx={{ mt: 1, bgcolor: 'white' }}>
              {["today", "7d", "30d"].map((r) => (
                <Button key={r} onClick={() => setSelectedRange(r)} variant={selectedRange === r ? "contained" : "outlined"}>
                  {r === 'today' ? 'Hari ini' : r === '7d' ? '7 Hari Lepas' : '30 Hari Lepas'}
                </Button>
              ))}
            </ButtonGroup>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)} sx={{ borderRadius: 2 }}>
            Tambah
          </Button>
        </Box>

        {/* Stats/Filter Cards */}
        <Grid container spacing={2} mb={4}>
          {FILTERS.map((f) => (
            <Grid key={f.value} size={3}>
              <Card onClick={() => setStatusFilter(f.value)} sx={{ p: 1.5, textAlign: 'center', cursor: 'pointer', borderRadius: 3, border: 2, borderColor: statusFilter === f.value ? 'primary.main' : 'transparent' }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary">{f.label}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* The List Container */}
        <Card sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <Box sx={{ p: 2, bgcolor: '#fff', borderBottom: '1px solid #eee' }}>
            <TextField fullWidth variant="standard" placeholder="Cari Guru..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ disableUnderline: true, startAdornment: <SearchIcon color="disabled" sx={{ mr: 1 }} /> }}
            />
          </Box>

          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>
          ) : (
            <List disablePadding>
              {Object.entries(groupedLogs).map(([date, entries]) => (
                <Box key={date}>
                  <ListSubheader sx={{ bgcolor: '#f8f9fa', fontWeight: 800 }}>{date}</ListSubheader>
                  {entries.map((log, idx) => (
                    <ListItem key={log.id} divider={idx < entries.length - 1}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: log.action === "in" ? "success.light" : "error.light" }}>
                          {log.action === "in" ? <LoginIcon fontSize="small" /> : <LogoutIcon fontSize="small" />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography fontWeight={700} sx={{ color: 'text.primary' }}>
                              {log.userName || log.teacherName}
                            </Typography>

                            {/* The "LEWAT" Chip as seen in the design */}
                            {log.action === "in" && log.attendanceType === 'LEWAT' && (
                              <Chip
                                label="LEWAT"
                                size="small"
                                sx={{
                                  fontWeight: 800,
                                  height: 18,
                                  fontSize: '0.65rem',
                                  bgcolor: '#fff3e0', // Light orange background
                                  color: '#e65100',   // Dark orange text
                                  border: '1px solid #ffb74d',
                                  borderRadius: '4px'
                                }}
                              />
                            )}

                            {/* Manual Entry Indicator */}
                            {log.isManual && (
                              <Chip
                                label="MANUAL"
                                size="small"
                                variant="outlined"
                                sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {log.isAbsentVirtual ? 'No record found' : `Clocked ${log.action.toUpperCase()}`}
                          </Typography>
                        }
                      />
                      <Typography variant="subtitle2" fontWeight={800}>
                        {log.displayTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </ListItem>
                  ))}
                </Box>
              ))}
            </List>
          )}
        </Card>

        {/* Manual Entry Dialog */}
        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
          <DialogTitle sx={{ fontWeight: 800 }}>Tambah Kedatangan</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel>Guru</InputLabel>
              <Select label="Teacher" value={manualEntry.teacherId} onChange={(e) => setManualEntry({ ...manualEntry, teacherId: e.target.value })}>
                {teachers.map((teacher) => (
                  <MenuItem key={teacher._id} value={teacher._id}>{teacher.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Tarikh" type="date" fullWidth InputLabelProps={{ shrink: true }} value={manualEntry.date} onChange={(e) => setManualEntry({ ...manualEntry, date: e.target.value })} />
            <Box display="flex" gap={2}>
              <TextField label="Masa Masuk" type="time" fullWidth InputLabelProps={{ shrink: true }} value={manualEntry.timeIn} onChange={(e) => setManualEntry({ ...manualEntry, timeIn: e.target.value })} />
              <TextField label="Masa Keluar" type="time" fullWidth InputLabelProps={{ shrink: true }} value={manualEntry.timeOut} onChange={(e) => setManualEntry({ ...manualEntry, timeOut: e.target.value })} />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleManualSubmit} variant="contained">Save Record</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}