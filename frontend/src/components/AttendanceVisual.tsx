import React, { useEffect, useMemo } from "react";
import { 
  Box, 
  Stack, 
  Typography, 
  Paper, 
  Divider, 
  Tooltip, 
  IconButton,
  Skeleton
} from "@mui/material";
import { 
  TrendingUp, 
  TrendingDown, 
  Info, 
  Clock, 
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useAttendance } from "../hooks/useAttendance";
import type { HistoryEntry } from "../features/Kedatangan/type";

interface Props {
  userId: string;
  size?: number;
}

export default function AttendanceVisual({ userId, size = 140 }: Props) {
  const { historyByDate, fetchAttendanceForRange, loading } = useAttendance(userId);

  // Fetch this month attendance on mount
  useEffect(() => {
    if (!userId) return;

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10);

    fetchAttendanceForRange(start, end);
  }, [userId, fetchAttendanceForRange]);

  // Compute stats
  const stats = useMemo(() => {
    const allInEntries: HistoryEntry[] = Object.values(historyByDate)
      .flat()
      .filter(e => e.action === "in");

    const total = allInEntries.length;
    if (total === 0) {
      return { accuracy: 0, onTime: 0, late: 0, avgTime: "--:--" };
    }

    const lateEntries = allInEntries.filter(e => e.attendanceType === "LEWAT");
    const late = lateEntries.length;
    const onTime = total - late;
    const accuracy = Math.round((onTime / total) * 100);

    const totalMinutes = allInEntries.reduce((acc, curr) => {
      const date = new Date(curr.timestamp || "");
      return acc + (date.getHours() * 60 + date.getMinutes());
    }, 0);

    const avgTotalMinutes = Math.floor(totalMinutes / total);
    let avgHours = Math.floor(avgTotalMinutes / 60);
    const avgMins = (avgTotalMinutes % 60);
    const ampm = avgHours >= 12 ? "PM" : "AM";
    avgHours = avgHours % 12 || 12; // Convert 0 -> 12
    const avgTime = `${avgHours.toString().padStart(2, "0")}:${avgMins.toString().padStart(2, "0")} ${ampm}`;

    return { 
      accuracy, 
      onTime, 
      late, 
      avgTime
    };
  }, [historyByDate]);

  // SVG ring calculations
  const strokeWidth = 10;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (stats.accuracy / 100) * circumference;
  const statusColor = stats.accuracy >= 90 
    ? "#2e7d32" 
    : stats.accuracy >= 75 
      ? "#ed6c02" 
      : "#d32f2f";

  // Loading skeleton
  if (loading) {
    return (
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
        <Stack direction="row" spacing={4}>
          <Skeleton variant="circular" width={size} height={size} />
          <Stack spacing={1} flex={1}>
            <Skeleton variant="rectangular" height={20} />
            <Skeleton variant="rectangular" height={20} />
            <Skeleton variant="rectangular" height={20} />
          </Stack>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary" fontWeight={600} gutterBottom>
            PRESTASI BULAN INI
          </Typography>
          <Typography variant="h6" fontWeight={800}>
            Ketepatan Masa
          </Typography>
        </Box>
        <Tooltip title="Data dikira berdasarkan waktu 'Punch In' berbanding jadual kerja anda.">
          <IconButton size="small">
            <Info size={18} />
          </IconButton>
        </Tooltip>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
        {/* Circular ring */}
        <Box position="relative" width={size} height={size}>
          <svg width={size} height={size}>
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="#f0f2f5"
              strokeWidth={strokeWidth}
              fill="none"
            />
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke={statusColor}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform={`rotate(-90 ${center} ${center})`}
              style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
            />
          </svg>

          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="h4" fontWeight={900} sx={{ color: statusColor, lineHeight: 1 }}>
              {stats.accuracy}%
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              SKOR
            </Typography>
          </Box>
        </Box>

        {/* Stats */}
        <Stack spacing={2} flex={1} width="100%">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <CheckCircle size={16} color="#2e7d32" />
              <Typography variant="body2" color="text.secondary">Tepat Waktu</Typography>
            </Stack>
            <Typography variant="body2" fontWeight={700}>{stats.onTime} Hari</Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <AlertCircle size={16} color="#d32f2f" />
              <Typography variant="body2" color="text.secondary">Lewat</Typography>
            </Stack>
            <Typography variant="body2" fontWeight={700}>{stats.late} Hari</Typography>
          </Stack>

          <Divider />

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <Clock size={16} />
              <Typography variant="body2" color="text.secondary">Purata Masuk</Typography>
            </Stack>
            <Typography variant="body2" fontWeight={700} color="primary.main">
              {stats.avgTime}
            </Typography>
          </Stack>
        </Stack>
      </Stack>

      {/* Performance note */}
      <Box 
        mt={3} 
        p={1.5} 
        sx={{ 
          bgcolor: stats.accuracy >= 80 ? 'rgba(46, 125, 50, 0.05)' : 'rgba(237, 108, 2, 0.05)',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}
      >
        <Box sx={{ 
          p: 0.5, 
          borderRadius: 1, 
          bgcolor: stats.accuracy >= 80 ? 'rgba(46, 125, 50, 0.1)' : 'rgba(237, 108, 2, 0.1)'
        }}>
          {stats.accuracy >= 80 ? (
            <TrendingUp size={18} color="#2e7d32" />
          ) : (
            <TrendingDown size={18} color="#ed6c02" />
          )}
        </Box>
        <Typography variant="caption" fontWeight={600} color={stats.accuracy >= 80 ? "success.dark" : "warning.dark"}>
          {stats.accuracy >= 80 
            ? "Prestasi anda cemerlang! Kekalkan momentum." 
            : "Ada sedikit penurunan. Cuba untuk hadir lebih awal."}
        </Typography>
      </Box>
    </Paper>
  );
}
