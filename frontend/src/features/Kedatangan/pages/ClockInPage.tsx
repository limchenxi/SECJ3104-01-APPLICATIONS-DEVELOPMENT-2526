import { useState, useEffect, useCallback, type JSX, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  ButtonGroup,
  Stack,
  Chip,
  Divider,
  useTheme
} from "@mui/material";

import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import HistoryIcon from "@mui/icons-material/History";
import PersonIcon from "@mui/icons-material/Person";
import { useAttendance } from "../../../hooks/useAttendance";
import useAuth from "../../../hooks/useAuth";
import { type ActionId, type HistoryRange, type HistoryRangeDetails, type Action, type HistoryEntry, type FormattedHistoryEntry, type SnackbarState } from "../type";

const HISTORY_RANGES: { id: HistoryRange; label: string; days: number }[] = [
  { id: "today", label: "Hari Ini", days: 0 },
  { id: "7d", label: "7 Hari Lepas", days: 7 },
  { id: "30d", label: "30 Hari Lepas", days: 30 },
];

const ACTIONS: Action[] = [
  { id: "in", label: "Clock In", icon: <LoginIcon fontSize="large" />, color: "success" },
  { id: "out", label: "Clock Out", icon: <LogoutIcon fontSize="large" />, color: "error" },
];

const formatTime = (d: Date): string =>
  d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

const formatDate = (d: Date): string =>
  d.toLocaleDateString("ms-MY", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const toISODateString = (d: Date): string =>
  d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).replace(/-/g, '-');

const calculateStartDate = (rangeID: HistoryRange): string => {
  const range: HistoryRangeDetails | undefined = HISTORY_RANGES.find(r => r.id === rangeID);
  if (!range) return toISODateString(new Date());

  const d = new Date();
  const daysToSubtract = range.days > 0 ? range.days - 1 : 0;
  d.setDate(d.getDate() - daysToSubtract);
  return toISODateString(d);
}

export default function AttendancePage(): JSX.Element {
  const { user } = useAuth();
  const theme = useTheme();

  const [selectedRange, setSelectedRange] = useState<HistoryRange>("today");
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, text: "" });

  if (!user?.id) {
    return <></>;
  }

  const { clockIn, clockOut, fetchAttendanceForRange, error, historyByDate } = useAttendance(user.id);

  const todayKey = useMemo(() => toISODateString(new Date()), []);
  const rangeInfo = HISTORY_RANGES.find(r => r.id === selectedRange)!;
  const endDate = toISODateString(new Date());
  const startDate = calculateStartDate(selectedRange);

  const todayEntries = historyByDate[todayKey] || [];
  const sortedTodayEntries = [...todayEntries].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const lastAction = sortedTodayEntries.length ? sortedTodayEntries[0].action : "none";
  const currentStatus: ActionId | "none" = lastAction;

  const attendanceHistory = useMemo(() => {
    const allEntries = Object.entries(historyByDate)
      .filter(([date]) => date >= startDate && date <= endDate)
      .flatMap(([, entries]) => entries)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return allEntries;
  }, [historyByDate, startDate, endDate]);


  const groupedHistory = useMemo(() => {
    return attendanceHistory.reduce((acc, entry) => {
      const dateKey = toISODateString(entry.timestamp);
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(entry);
      return acc;
    }, {} as Record<string, HistoryEntry[]>);
  }, [attendanceHistory]);

  const sortedDates = useMemo(() => Object.keys(groupedHistory).sort().reverse(), [groupedHistory]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (error) {
      setSnackbar({
        open: true,
        text: `Tindakan Gagal: ${error}`,
      });
    }
  }, [error]);

  useEffect(() => {
    if (user.id && startDate && endDate) {
      fetchAttendanceForRange(startDate, endDate);
    }
  }, [user.id, startDate, endDate, fetchAttendanceForRange]);

  const handleClockAction = useCallback(async (actionId: ActionId) => {
    if (!user.id) {
      setSnackbar({ open: true, text: "Pengguna tidak dijumpai" });
      return;
    }

    let successTime: string | null = null;
    let actionFailed = false;

    if (actionId === "in") {
      try {
        const res = await clockIn();
        if (res?.timeIn) { successTime = new Date(res.timeIn).toLocaleTimeString(); }
      }
      catch (err: any) { actionFailed = true; }
    }

    if (actionId === "out") {
      try {
        const res = await clockOut();
        if (res?.timeOut) { successTime = new Date(res.timeOut).toLocaleTimeString(); }
      }
      catch (err: any) { actionFailed = true; }
    }

    // Show Snackbar
    if (successTime) {
      setSnackbar({
        open: true,
        text: `${actionId === "in" ? "Clock In" : "Clock Out"} berjaya pada ${successTime}`,
      })
    } else if (actionFailed) {
      setSnackbar({
        open: true,
        text: `${actionId === "in" ? "Clock In" : "Clock Out"} gagal: ${error ?? 'Unknown error'}`,
      });
    }

    if (user.id) {
      fetchAttendanceForRange(todayKey, todayKey);
    }

  }, [clockIn, clockOut, user?.id, error, fetchAttendanceForRange, todayKey]);


  const getStatusLabel = (a: ActionId | "none"): string => {
    if (a === "in") return "AKTIF (Clocked In)";
    if (a === "out") return "TIDAK AKTIF (Clocked Out)";
    return "TIADA REKOD";
  };

  const getStatusColor = (a: ActionId | "none"): "success" | "error" | "default" => {
    if (a === "in") return "success";
    if (a === "out") return "error";
    return "default";
  };

  const formatHistoryEntry = (entry: HistoryEntry): FormattedHistoryEntry => {
    const meta = ACTIONS.find((a) => a.id === entry.action);
    const colorKey = (meta?.color ?? "primary");

    return {
      label: meta?.label ?? "Unknown Action",
      time: formatTime(entry.timestamp),
      icon: meta?.icon ?? <AccessTimeIcon />,
      colorPath: `${colorKey}.main`,
    };
  };

  return (
    <Box sx={{ p: 3, maxWidth: "xl", mx: "auto" }}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="info" variant="filled">
          {snackbar.text}
        </Alert>
      </Snackbar>

      <Stack spacing={4}>
        {/* Header Section */}
        <Box>
          <Typography variant="h4" sx={{ mb: 0.5, display: 'flex', alignItems: 'center' }}>
            <AccessTimeIcon color="primary" fontSize="large" sx={{ mr: 1.5 }} /> Kedatangan Saya
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Uruskan masa masuk dan keluar harian anda di sini.
          </Typography>
        </Box>

        {/* Dashboard Grid */}
        <Grid container spacing={4}>
          {/* Left Column: User Info & Clock */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={4}>
              {/* User Card */}
              <Card sx={{ borderRadius: 2, boxShadow: 2, bgcolor: theme.palette.primary.main, color: 'white' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                    <Avatar sx={{ bgcolor: 'white', color: theme.palette.primary.main, width: 56, height: 56 }}>
                      <PersonIcon fontSize="large" />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>{user.name}</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>ID: {user.id}</Typography>
                    </Box>
                  </Stack>
                  <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 2 }} />
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" fontWeight={600}>Status Semasa:</Typography>
                    <Chip
                      label={getStatusLabel(currentStatus)}
                      color={getStatusColor(currentStatus) === 'default' ? 'default' : getStatusColor(currentStatus) as any}
                      sx={{ bgcolor: 'white', color: getStatusColor(currentStatus) === 'error' ? 'error.main' : 'success.main', fontWeight: 'bold' }}
                    />
                  </Stack>
                </CardContent>
              </Card>

              {/* Digital Clock Card */}
              <Card sx={{ borderRadius: 2, boxShadow: 2, textAlign: 'center', p: 2 }}>
                <Typography variant="h2" fontFamily="monospace" fontWeight={700} color="primary">
                  {formatTime(currentTime)}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>
                  {formatDate(currentTime)}
                </Typography>
              </Card>
            </Stack>
          </Grid>

          {/* Right Column: Actions */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CardContent sx={{ width: '100%' }}>
                <Typography variant="h6" fontWeight={700} mb={3} textAlign="center">Tindakan</Typography>
                <Stack spacing={3}>
                  {ACTIONS.map((action) => {
                    let disabled = false;
                    if (action.id === "in" && !(currentStatus === "out" || currentStatus === "none")) disabled = true;
                    if (action.id === "out" && currentStatus !== "in") disabled = true;

                    return (
                      <Button
                        key={action.id}
                        variant="contained"
                        size="large"
                        fullWidth
                        disabled={disabled}
                        color={action.color as any}
                        onClick={() => handleClockAction(action.id)}
                        startIcon={action.icon}
                        sx={{
                          py: 3,
                          borderRadius: 3,
                          fontSize: '1.2rem',
                          fontWeight: 800,
                          opacity: disabled ? 0.5 : 1
                        }}
                      >
                        {action.label}
                      </Button>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* History Section */}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={700} display="flex" alignItems="center">
              <HistoryIcon sx={{ mr: 1 }} /> Sejarah Kedatangan
            </Typography>
            <ButtonGroup variant="outlined" size="small" sx={{ bgcolor: 'white' }}>
              {HISTORY_RANGES.map((range) => (
                <Button key={range.id} onClick={() => setSelectedRange(range.id)} variant={selectedRange === range.id ? "contained" : "outlined"}>
                  {range.label}
                </Button>
              ))}
            </ButtonGroup>
          </Stack>

          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            {attendanceHistory.length === 0 ? (
              <Box p={4} textAlign="center">
                <Typography color="text.secondary" fontStyle="italic">
                  Tiada rekod aktiviti untuk tempoh {rangeInfo.label}.
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {sortedDates.map((dateKey) => (
                  <Box key={dateKey}>
                    <ListItem sx={{ bgcolor: theme.palette.grey[100], borderBottom: '1px solid #eee' }}>
                      <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                        {dateKey === todayKey ? "Hari Ini" : formatDate(new Date(dateKey))}
                      </Typography>
                    </ListItem>
                    {groupedHistory[dateKey].map((entry) => {
                      const f = formatHistoryEntry(entry);
                      return (
                        <ListItem key={entry.id} divider>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: f.colorPath }}>{f.icon}</Avatar>
                          </ListItemAvatar>
                          <ListItemText primary={f.label} />
                          <Typography variant="body2" fontFamily="monospace" fontWeight={700}>
                            {f.time}
                          </Typography>
                        </ListItem>
                      );
                    })}
                  </Box>
                ))}
              </List>
            )}
          </Card>
        </Box>
      </Stack>
    </Box>
  );
}