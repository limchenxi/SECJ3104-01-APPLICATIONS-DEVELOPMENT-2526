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
} from "@mui/material";

import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import HistoryIcon from "@mui/icons-material/History";
import PersonIcon from "@mui/icons-material/Person";
import DateRangeIcon from "@mui/icons-material/DateRange"
import { useAttendance } from "../../../hooks/useAttendance";
import useAuth from "../../../hooks/useAuth";
import { type ActionId, type HistoryRange, type HistoryRangeDetails, type Action, type HistoryEntry, type FormattedHistoryEntry, type SnackbarState } from "../type";

const HISTORY_RANGES: { id: HistoryRange; label: string; days: number }[] = [
  { id: "today", label: "Today", days: 0 },
  { id: "7d", label: "Last 7 Days", days: 7 },
  { id: "30d", label: "Last 30 Days", days: 30 },
];

const ACTIONS: Action[] = [
  { id: "in", label: "Clock In", icon: <LoginIcon />, color: "success" },
  { id: "out", label: "Clock Out", icon: <LogoutIcon />, color: "error" },
];

const formatTime = (d: Date): string =>
  d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

const formatDate = (d: Date): string =>
  d.toLocaleDateString("en-US", {
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
  // Sort today's entries by timestamp descending (latest first)
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

  // // Attendance history (no break entries)
  // const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (error) {
      setSnackbar({
        open: true,
        text: `Action Failed: ${error}`,
      });
    }
  }, [error]);

  useEffect(() => {
    if (user.id && startDate && endDate) {
      fetchAttendanceForRange(startDate, endDate);
    }
  }, [user.id, startDate, endDate, fetchAttendanceForRange]);

  // const handleClockAction = useCallback(async (actionId: ActionId) => {
  //   if(!user.id) {
  //     setSnackbar({
  //       open: true,
  //       text: "User not found",
  //     });
  //     return;
  //   }


  //   if(actionId === "in") {
  //     try {
  //       const res = await clockIn();
  //       if(res?.timeIn) {
  //         setSnackbar({
  //           open: true,
  //           text: `Clock in successful at ${new Date(res.timeIn).toLocaleTimeString()}`,
  //         })
  //       }
  //       fetchTodayAttendance();
  //     }
  //     catch(err: any) {
  //       setSnackbar({
  //         open: true,
  //         text: `Clock in failed: ${error ?? 'Unknown error'}`,
  //       });
  //     }
  //   }

  //   if(actionId === "out") {
  //     try {
  //       const res = await clockOut();
  //       if(res?.timeOut) {
  //         setSnackbar({
  //           open: true,
  //           text: `Clock out successful at ${new Date(res.timeOut).toLocaleTimeString()}`,
  //         })
  //       }
  //       fetchTodayAttendance();
  //     }
  //     catch(err: any) {
  //       setSnackbar({
  //         open: true,
  //         text: `Clock in failed: ${error ?? 'Unknown error'}`,
  //       });
  //     }
  //   }
  // }, [clockIn, clockOut, user?.id, error, fetchTodayAttendance]);

  const handleClockAction = useCallback(async (actionId: ActionId) => {
    if (!user.id) {
      setSnackbar({ open: true, text: "User not found" });
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
        text: `${actionId === "in" ? "Clock in" : "Clock out"} successful at ${successTime}`,
      })
    } else if (actionFailed) {
      setSnackbar({
        open: true,
        text: `${actionId === "in" ? "Clock in" : "Clock out"} failed: ${error ?? 'Unknown error'}`,
      });
    }

    // CRITICAL FIX: After clocking, refresh ONLY the current day's history
    // to instantly update currentStatus and the log entry.
    if (user.id) {
      fetchAttendanceForRange(todayKey, todayKey);
    }

  }, [clockIn, clockOut, user?.id, error, fetchAttendanceForRange, todayKey]);


  // const currentStatus: ActionId | "none" = history.length ? history[0].action : "none";

  const getStatusLabel = (a: ActionId | "none"): string => {
    if (a === "in") return "ACTIVE";
    if (a === "out") return "LOGGED OUT";
    return "PENDING";
  };

  const getStatusColor = (a: ActionId | "none"): string => {
    if (a === "in") return "success.main";
    if (a === "out") return "error.main";
    return "text.disabled";
  };

  // Explicitly define the return type as FormattedHistoryEntry
  const formatHistoryEntry = (entry: HistoryEntry): FormattedHistoryEntry => {
    const meta = ACTIONS.find((a) => a.id === entry.action);

    // Fallback logic must return a color compatible with the narrower Action['color'] type
    // Since we only use 'success' and 'error' in ACTIONS, we ensure the fallback is also a valid MUI color.
    const colorKey = (meta?.color ?? "primary");

    return {
      label: meta?.label ?? "Unknown Action",
      time: formatTime(entry.timestamp),
      icon: meta?.icon ?? <AccessTimeIcon />,
      // Construct the full color path string here
      colorPath: `${colorKey}.main`,
    };
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5", p: 4 }}>
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity="info" variant="filled">
          {snackbar.text}
        </Alert>
      </Snackbar>

      <Box maxWidth="800px" mx="auto">
        {/* Header Card */}
        <Card sx={{ mb: 4, borderTop: 4, borderColor: "primary.main" }}>
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              pb={2}
              borderBottom="1px solid #eee"
            >
              <Box display="flex" alignItems="center">
                <PersonIcon
                  sx={{ fontSize: 40, color: "primary.main", mr: 2 }}
                />
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    {user.name}
                  </Typography>
                  <Typography color="text.secondary">
                    ID: {user.id}
                  </Typography>
                </Box>
              </Box>

              <Box textAlign="right">
                <Typography variant="body2" color="text.secondary">
                  Current Status:
                </Typography>
                <Typography
                  sx={{
                    bgcolor: "grey.100",
                    borderRadius: 2,
                    px: 2,
                    py: 0.5,
                    fontWeight: 700,
                    color: getStatusColor(currentStatus),
                  }}
                >
                  {getStatusLabel(currentStatus)}
                </Typography>
              </Box>
            </Box>

            <Box
              mt={3}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              bgcolor="primary.light"
              p={2}
              borderRadius={2}
            >
              <Box>
                <Typography variant="h3" fontFamily="monospace" fontWeight={800}>
                  {formatTime(currentTime)}
                </Typography>
                <Typography color="primary.dark">
                  {formatDate(currentTime)}
                </Typography>
              </Box>
              <AccessTimeIcon sx={{ fontSize: 40, color: "primary.main" }} />
            </Box>
          </CardContent>
        </Card>

        {/* ACTION BUTTONS */}
        <Grid container spacing={2} mb={4}>
          {ACTIONS.map((action) => {
            const isCurrent = action.id === currentStatus;

            let disabled = false;

            // Only allow 'Clock In' if last action is 'out' or none
            if (action.id === "in" && !(currentStatus === "out" || currentStatus === "none")) disabled = true;
            // Only allow 'Clock Out' if last action is 'in'
            if (action.id === "out" && currentStatus !== "in") disabled = true;

            return (
              <Grid>
                <Button
                  variant="contained"
                  fullWidth
                  disabled={disabled}
                  color={action.color}
                  onClick={() => handleClockAction(action.id)}
                  sx={{
                    py: 3,
                    flexDirection: "column",
                    borderRadius: 3,
                    boxShadow: 3,
                    ...(isCurrent && {
                      border: "3px solid",
                      borderColor: "primary.light",
                    }),
                  }}
                >
                  {action.icon}
                  <Typography mt={1} fontWeight={700}>
                    {action.label}
                  </Typography>
                </Button>
              </Grid>
            );
          })}
        </Grid>

        {/* HISTORY */}
        <Card>
          <CardContent>
            <Box
              display="flex"
              alignItems="center"
              mb={2}
              borderBottom="1px solid #eee"
              pb={1}
            >
              <HistoryIcon sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="h6" fontWeight={700}>
                Attendance Log
              </Typography>
            </Box>

            <ButtonGroup variant="outlined" size="small">
              {HISTORY_RANGES.map((range) => (
                <Button key={range.id} onClick={() => setSelectedRange(range.id)} variant={selectedRange === range.id ? "contained" : "outlined"}>
                  {range.label}
                </Button>
              ))}
            </ButtonGroup>

            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
              <DateRangeIcon sx={{ mr: 1, fontSize: 18}} />
              <Typography variant="body2">
                Viewing <b>{rangeInfo.label}</b> ({startDate} to {endDate})
              </Typography>
            </Box>

            {attendanceHistory.length === 0 ? (
              <Typography textAlign="center" color="text.secondary" fontStyle="italic">
                No activity recorded for the {rangeInfo.label} period.
              </Typography>
            ) : (
              sortedDates.map((dateKey) => (
                <Box key={dateKey} mb={3}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{mt: 2, mb: 1, borderBottom: '2px solid #ddd', pb: 0.5, color: 'primary.dark'}}>
                    {dateKey === todayKey ? "Today" : formatDate(new Date(dateKey))}
                  </Typography>
                  <List disablePadding>
                    {groupedHistory[dateKey].map((entry) => {
                      const f = formatHistoryEntry(entry);
                      return (
                        <ListItem key={entry.id} 
                        sx={{borderRadius: 2, mb: 0.5, transition: "0.2s", "&:hover": { bgcolor: "primary.lighter"}, }} 
                        secondaryAction={
                          <Typography variant="body1" fontFamily="monospace" fontWeight={700}>{f.time}</Typography>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: f.colorPath}}>{f.icon}</Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={f.label} />
                      </ListItem>
                      );
                    })}
                  </List>
                </Box>
              ))
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}