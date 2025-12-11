import { useState, useEffect, useCallback, type JSX } from "react";
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
} from "@mui/material";

import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import HistoryIcon from "@mui/icons-material/History";
import PersonIcon from "@mui/icons-material/Person";
import { useAttendance } from "../../../hooks/useAttendance";
import useAuth from "../../../hooks/useAuth";
import { type ActionId, type Action, type HistoryEntry, type FormattedHistoryEntry, type SnackbarState} from "../type";

// Only "Clock In" and "Clock Out"
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

export default function AttendancePage(): JSX.Element {
  const {user} = useAuth();

  if(!user?.id) {
    return <></>;
  }

  const { clockIn, clockOut, fetchTodayAttendance, error, todayAttendance } = useAttendance(user?.id);

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, text: "" });

  // Attendance history (no break entries)
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if(error) {
      setSnackbar({
        open: true,
        text: `Action Failed: ${error}`,
      });
    }
  }, [error]);

  useEffect(() => {
    if(todayAttendance) {
      setHistory(todayAttendance);
    }
  }, [todayAttendance]);

  useEffect(() => {
    if(user?.id) {
      fetchTodayAttendance();
    }
  }, [user?.id, fetchTodayAttendance]);

  const handleClockAction = useCallback(async (actionId: ActionId) => {
    if(!user.id) {
      setSnackbar({
        open: true,
        text: "User not found",
      });
      return;
    }

    if(actionId === "in") {
      try {
        const res = await clockIn();
        if(res?.timeIn) {
          setSnackbar({
            open: true,
            text: `Clock in successful at ${new Date(res.timeIn).toLocaleTimeString()}`,
          })
        }
        fetchTodayAttendance();
      }
      catch(err: any) {
        setSnackbar({
          open: true,
          text: `Clock in failed: ${error ?? 'Unknown error'}`,
        });
      }
    }

    if(actionId === "out") {
      try {
        const res = await clockOut();
        if(res?.timeOut) {
          setSnackbar({
            open: true,
            text: `Clock out successful at ${new Date(res.timeOut).toLocaleTimeString()}`,
          })
        }
        fetchTodayAttendance();
      }
      catch(err: any) {
        setSnackbar({
          open: true,
          text: `Clock in failed: ${error ?? 'Unknown error'}`,
        });
      }
    }
  }, [clockIn, clockOut, user?.id, error, fetchTodayAttendance]);

  const currentStatus: ActionId | "none" = history.length ? history[0].action : "none";

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

            // Rules:
            if (action.id === "in" && currentStatus === "in") disabled = true;
            if (
              action.id === "out" &&
              (currentStatus === "out" || currentStatus === "none")
            )
              disabled = true;

            return (
              <Grid>
                <Button
                  variant="contained"
                  fullWidth
                  disabled={disabled}
                  // action.color is 'success'|'error', which is compatible with the expanded ThemeColor
                  color={action.color} 
                  onClick={() => handleClockAction(action.id)}
                  sx={{
                    py: 3,
                    flexDirection: "column",
                    borderRadius: 3,
                    boxShadow: 3,
                    // Conditional styling based on status
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
                Recent Activity Log (Today)
              </Typography>
            </Box>

            {history.length === 0 ? (
              <Typography
                textAlign="center"
                color="text.secondary"
                fontStyle="italic"
              >
                No activity recorded today.
              </Typography>
            ) : (
              <List>
                {history.map((entry) => {
                  const f = formatHistoryEntry(entry);
                  return (
                    <ListItem
                      key={entry.id}
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        transition: "0.2s",
                        "&:hover": { bgcolor: "primary.lighter" },
                      }}
                      secondaryAction={
                        <Typography
                          variant="body1"
                          fontFamily="monospace"
                          fontWeight={700}
                        >
                          {f.time}
                        </Typography>
                      }
                    >
                      <ListItemAvatar>
                        {/* Avatar sx prop is safe using colorPath */}
                        <Avatar sx={{ bgcolor: f.colorPath }}> 
                          {f.icon}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={f.label} />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}