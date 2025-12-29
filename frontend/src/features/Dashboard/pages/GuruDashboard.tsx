import React, { useEffect, useMemo, useState } from "react";
import { GridView} from "@mui/icons-material";
import {
  Alert,
  Box,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import {
  Clock,
  GraduationCap,
  FileText,
  User as UserIcon,
  ClipboardCheck,
  CalendarDays,
} from "lucide-react";
import { userApi } from "../../Users/api";
import { getPendingTasksCount } from "../../Cerapan/api/cerapanService";
import { QuickAction, StatCard } from "./component";
import { pentadbirService } from "../../Pentadbir/api/pentadbirService";
import AttendanceVisual from "../../../components/AttendanceVisual";

const CustomChip = ({
  label,
  color,
}: {
  label: string;
  color: "warning" | "error" | "success";
}) => {
  const colors = {
    warning: { bg: "#fff3e0", text: "#e65100" },
    error: { bg: "#fdecea", text: "#c62828" },
    success: { bg: "#e8f5e9", text: "#2e7d32" },
  };
  const style = colors[color];
  return (
    <Box
      component="span"
      sx={{
        backgroundColor: style.bg,
        color: style.text,
        padding: "2px 12px",
        borderRadius: "16px",
        fontSize: "0.75rem",
        fontWeight: "bold",
      }}
    >
      {label}
    </Box>
  );
};

function useGuruDashboardData() {
  const [data, setData] = useState({
    me: null as any,
    myAssignments: { classes: [] } as any,
    myEvaluations: [] as any[],
    loading: true,
    error: null as string | null,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [me, myAssignments, allEvaluations] = await Promise.all([
          userApi.getMe(),
          userApi.getMyAssignments(),
          pentadbirService.getAllEvaluations(),
        ]);

        const myEvaluations = allEvaluations.filter(
          (e: any) => e.teacherId === me._id
        );

        setData({
          me,
          myAssignments,
          myEvaluations,
          loading: false,
          error: null,
        });
      } catch (e) {
        console.error("Guru Dashboard Loading Error:", e);
        setData((prev) => ({
          ...prev,
          loading: false,
          error: "Gagal memuatkan data dashboard. Sila pastikan API tersedia.",
        }));
      }
    }
    loadData();
  }, []);

  const summary = useMemo(() => {
    const classCount = data.myAssignments?.classes?.length || 0;

    const pendingKendiri = data.myEvaluations.filter((e) => {
      const selfStatus = e.self_evaluation?.status || e.selfStatus;
      return selfStatus === "pending";
    }).length;

    const pendingObservations = data.myEvaluations.filter((e) => {
      const obs1Status = e.observation_1?.status || e.obs1Status;
      const obs2Status = e.observation_2?.status || e.obs2Status;
      return (
        obs1Status === "pending" ||
        (obs1Status === "submitted" && obs2Status === "pending")
      );
    }).length;

    return {
      classCount,
      pendingKendiri,
      pendingObservations,
    };
  }, [data]);

  return { ...data, summary };
}

// ---------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------

export default function GuruDashboard() {
  const { loading, error, summary, me } = useGuruDashboardData();

  const statsCards = [
    {
      title: "Jumlah Kelas",
      value: summary.classCount,
      icon: GraduationCap,
      color: "#1976d2", // Blue
    },
    {
      title: "Cerapan Perlu Dibuat",
      value: summary.pendingKendiri,
      icon: FileText,
      color: "#d32f2f", // Red (Danger)
    },
    {
      title: "Observation Akan Datang",
      value: summary.pendingObservations,
      icon: ClipboardCheck,
      color: "#d32f2f", // Red (Danger)
    },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          p: 3,
          maxWidth: "xl",
          mx: "auto",
          minHeight: "60vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: "xl", mx: "auto" }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: "xl", mx: "auto" }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box>
          <Typography variant="h4" sx={{ mb: 0.5 }}>
            <GridView color="primary" fontSize="large" /> Guru Dashboard
          </Typography>
          <Typography color="text.secondary" variant="h6">
            Selamat datang,{" "}
            <span style={{ fontWeight: 700, color: "#1976d2" }}>
              {me?.name}
            </span>
            !
          </Typography>
        </Box>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {statsCards.map((card) => (
            <StatCard
              key={card.title}
              title={card.title}
              value={card.value}
              icon={card.icon}
              color={card.color}
            />
          ))}
        </div>

        <AttendanceVisual userId={me._id} />

        <div className="p-5 bg-white shadow rounded-lg h-full">
          <h2 className="font-semibold text-lg mb-4">Tugas Harian (Pending)</h2>
          <ul className="space-y-4">
            <li className="flex justify-between items-center border-b pb-2">
              <Stack direction="row" spacing={1} alignItems="center">
                <FileText size={18} color="#d32f2f" />
                <span>Cerapan Kendiri Belum Selesai</span>
              </Stack>
              <CustomChip
                label={
                  summary.pendingKendiri > 0
                    ? `${summary.pendingKendiri} Tugasan`
                    : "Selesai"
                }
                color={summary.pendingKendiri > 0 ? "error" : "success"}
              />
            </li>
            <li className="flex justify-between items-center border-b pb-2">
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarDays size={18} color="#1976d2" />
                <span>Kehadiran</span>
              </Stack>
              <Typography
                variant="body2"
                color="primary.main"
                fontWeight="bold"
              >
                Sila Kemaskini
              </Typography>
            </li>
            <li className="flex justify-between items-center border-b pb-2">
              <Stack direction="row" spacing={1} alignItems="center">
                <ClipboardCheck size={18} color="#ed6c02" />
                <span>Menunggu Observasi Pentadbir</span>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {summary.pendingObservations > 0 ? "Dalam Proses" : "Tiada"}
              </Typography>
            </li>
          </ul>
        </div>

        {/* Quick Actions - 保持不变 */}
        <div className="p-5 bg-white shadow rounded-lg">
          <h2 className="font-semibold text-lg mb-4">Tindakan Pantas</h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <QuickAction label="Kedatangan" to="/kedatangan" />
            <QuickAction label="eRPH" to="/rph" />
            <QuickAction label="AI Quiz" to="/quiz" />
            <QuickAction label="Cerapan Kendiri" to="/cerapan" />
            <QuickAction label="Profile" to="/profile" />
          </div>
        </div>
      </Stack>
    </Box>
  );
}
