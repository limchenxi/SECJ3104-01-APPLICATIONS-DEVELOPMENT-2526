import React, { useEffect, useMemo, useState } from "react";
import { GridView } from "@mui/icons-material";
import {
  Alert,
  Box,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import {
  BookOpen,
  ClipboardCheck,
  Users,
  LayoutTemplate,
  GraduationCap,
  FileText,
} from "lucide-react";
import { userApi } from "../../Users/api";
import { TeachingAssignmentAPI } from "../../TeachingAssignment/api";
import type { UserItem } from "../../Users/type";
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
    <span
      style={{
        backgroundColor: style.bg,
        color: style.text,
        padding: "2px 12px",
        borderRadius: "16px",
        fontSize: "0.75rem",
        fontWeight: "bold",
      }}
    >
      {label}
    </span>
  );
};

function usePentadbirDashboardData() {
  const [data, setData] = useState({
    me: null as any,
    users: [] as UserItem[],
    evaluations: [] as any[],
    myAssignments: { classes: [] as string[], subjects: [] as string[] },
    loading: true,
    error: null as string | null,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [me, allUsers, allEvaluations] = await Promise.all([
          userApi.getMe(),
          userApi.getAll(),
          pentadbirService.getAllEvaluations(),
        ]);

        let myAssignments = {
          classes: [] as string[],
          subjects: [] as string[],
        };
        if (me.role?.includes("GURU")) {
          myAssignments = await userApi.getMyAssignments();
        }

        setData({
          me,
          users: allUsers,
          evaluations: allEvaluations,
          myAssignments,
          loading: false,
          error: null,
        });
      } catch (e) {
        console.error("Dashboard Loading Error:", e);
        setData((prev) => ({
          ...prev,
          loading: false,
          error:
            "Gagal memuatkan data dashboard. Sila pastikan fail API tersedia.",
        }));
      }
    }
    loadData();
  }, []);

  const summary = useMemo(() => {
    const users = data.users || [];
    const evaluations = data.evaluations || [];
    let guruCount = 0;
    let pentadbirCount = 0;

    users.forEach((user) => {
      const userRoles = Array.isArray(user.role) ? user.role : [];
      if (userRoles.includes("GURU")) guruCount++;
      if (userRoles.includes("PENTADBIR")) pentadbirCount++;
    });

    const pendingForAdmin = evaluations.filter((e) => {
      const obs1Status = e.observation_1?.status || e.obs1Status;
      const obs2Status = e.observation_2?.status || e.obs2Status;
      return (
        obs1Status === "pending" ||
        (obs1Status === "submitted" && obs2Status === "pending")
      );
    }).length;

    const mySelfPending = evaluations.filter((e) => {
      const isMe = e.teacherId === data.me?._id;
      const selfStatus = e.self_evaluation?.status || e.selfStatus;
      return isMe && selfStatus === "pending";
    }).length;

    return {
      pentadbirCount,
      guruCount,
      pendingForAdmin,
      myClassCount: data.myAssignments.classes?.length || 0,
      mySelfPending,
    };
  }, [data]);
  
  return { ...data, summary };
}

export default function PentadbirDashboard() {
  const { loading, error, summary, me } = usePentadbirDashboardData();
  const isGuru = me?.role?.includes("GURU");

  const allStatsCards = useMemo(() => {
    const baseCards = [
      {
        title: "Jumlah Pentadbir",
        value: summary.pentadbirCount,
        icon: Users,
        color: "#1976d2",
      },
      {
        title: "Jumlah Guru",
        value: summary.guruCount,
        icon: BookOpen,
        color: "#2e7d32",
      },
      {
        title: "Cerapan Tertangguh",
        value: summary.pendingForAdmin,
        icon: ClipboardCheck,
        color: "#ffc107",
      },
    ];

    if (isGuru) {
      baseCards.push(
        {
          title: "Jumlah Kelas Saya",
          value: summary.myClassCount,
          icon: GraduationCap,
          color: "#9c27b0", // 紫色
        },
        {
          title: "Cerapan Kendiri",
          value: summary.mySelfPending,
          icon: FileText,
          color: "#d32f2f", // 红色
        }
      );
    }
    return baseCards;
  }, [summary, isGuru]);

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
            <GridView color="primary" fontSize="large" /> Pentadbir Dashboard
          </Typography>
          <Typography color="text.secondary">
            Selamat datang, <strong>{me?.name}</strong>.
          </Typography>
        </Box>

        <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 2, 
            '& > *': { 
                flex: { 
                    xs: '1 1 100%',                                   // 手机端每行 1 个
                    sm: '1 1 calc(50% - 16px)',                       // 平板端每行 2 个
                    md: isGuru ? '1 1 calc(20% - 16px)' : '1 1 calc(33.33% - 16px)' // 电脑端 5 个或 3 个
                } 
            } 
        }}>
          {allStatsCards.map((card) => (
            <StatCard
              key={card.title}
              title={card.title}
              value={card.value}
              icon={card.icon}
              color={card.color}
            />
          ))}
        </Box>

        {isGuru ? (<AttendanceVisual userId={me._id} />) : (null)}

        <div className="p-5 bg-white shadow rounded-lg h-full">
          <h2 className="font-semibold text-lg mb-4">Status Cerapan Semasa</h2>
          <ul className="space-y-4">
            <li className="flex justify-between items-center border-b pb-2">
              <span>Menunggu Cerapan Pentadbir</span>
              <CustomChip
                label={`${summary.pendingForAdmin} Guru`}
                color="warning"
              />
            </li>
            {isGuru && (
              <li className="flex justify-between items-center border-b pb-2">
                <span>Cerapan Kendiri Saya</span>
                <CustomChip
                  label={
                    summary.mySelfPending > 0 ? "Belum Selesai" : "Selesai"
                  }
                  color={summary.mySelfPending > 0 ? "error" : "success"}
                />
              </li>
            )}
          </ul>
        </div>

        <div className="p-5 bg-white shadow rounded-lg">
          <h2 className="font-semibold text-lg mb-4">Aktiviti Utama</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between">
              <ClipboardCheck
                color="#ed6c02"
                size={20}
                style={{ marginRight: 8 }}
              />
              <span>Pengurusan Cerapan</span>
              <a
                href="/pentadbir/cerapan"
                className="text-blue-600 font-bold hover:underline"
              >
                Lihat
              </a>
            </li>
            <li className="flex justify-between">
              <LayoutTemplate
                color="#ffc107"
                size={20}
                style={{ marginRight: 8 }}
              />
              <span>Pengurusan Template Rubrik</span>
              <a
                href="/pentadbir/template-rubrik"
                className="text-blue-600 font-bold hover:underline"
              >
                Lihat
              </a>
            </li>
            <li className="flex justify-between">
              <BookOpen color="#2e7d32" size={20} style={{ marginRight: 8 }} />
              <span>Pengurusan Tugasan Mengajar</span>
              <a
                href="/teaching-assignment"
                className="text-blue-600 font-bold hover:underline"
              >
                Lihat
              </a>
            </li>
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="p-5 bg-white shadow rounded-lg">
          <h2 className="font-semibold text-lg mb-4">Tindakan Pantas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickAction label="Pengurusan Cerapan" to="/pentadbir/cerapan" />
            <QuickAction
              label="Template Rubrik"
              to="/pentadbir/template-rubrik"
            />
            <QuickAction
              label="Teaching Assignment"
              to="/teaching-assignment"
            />
            <QuickAction label="Profile Saya" to="/profile" />
          </div>
        </div>
      </Stack>
    </Box>
  );
}
