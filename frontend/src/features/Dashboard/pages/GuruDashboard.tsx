import React, { useEffect, useMemo, useState } from "react";
import { GridView, CalendarToday, Book, Star } from "@mui/icons-material";
import { Alert, Box, Card, CardContent, CircularProgress, Stack, Typography } from "@mui/material";
import { Clock, GraduationCap, FileText, User as UserIcon } from "lucide-react";
import { userApi } from "../../Users/api"; 
import { getPendingTasksCount } from "../../Cerapan/api/cerapanService";

// ---------------------------------------------------------------
// 辅助组件 (StatCard, QuickAction) - 保持不变
// ---------------------------------------------------------------

function StatCard({ title, value, icon: IconComponent, color }) {
  return (
    <Card 
      sx={{ 
        boxShadow: 3, 
        borderLeft: `5px solid ${color}`, 
        transition: '0.3s',
        '&:hover': { 
            boxShadow: 6 
        } 
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="text.secondary" variant="subtitle2">
              {title}
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {value}
            </Typography>
          </Box>
          <IconComponent size={36} color={color} /> 
        </Stack>
      </CardContent>
    </Card>
  );
}

function QuickAction({ label, to }) {
  return (
    <a
      href={to}
      className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 text-center font-medium"
    >
      {label}
    </a>
  );
}

// ---------------------------------------------------------------
// Guru Data Hook 
// ---------------------------------------------------------------
function useGuruDashboardData() {
  const taskStatsPromise = getPendingTasksCount();
  const [data, setData] = useState({
    currentUserName: "Loading...",
    assignedClasses: 0,
    cerapan: 0, 
    loading: true,
    error: null as string | null,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const userMePromise = userApi.getMe();
        const assignmentsPromise = userApi.getMyAssignments(); 
        
        // 模拟 Cerapan 统计
        const taskStatsPromise = new Promise(resolve => 
             // 假设 cerapan 数量是 3
             setTimeout(() => resolve({ cerapanPending: 3 }), 300) 
        );
        
        const [userMe, assignmentsData, taskStats] = await Promise.all([
          userMePromise,
          assignmentsPromise,
          taskStatsPromise,
        ]);
        
        const assignedClassesCount = assignmentsData.classes?.length || 0;
        
        setData(prev => ({ 
          ...prev, 
          currentUserName: userMe.name, 
          assignedClasses: assignedClassesCount,
          cerapan: (taskStats as any).totalPending || 0,
          loading: false 
        }));
      } catch (e) {
        console.error("Guru Dashboard data fetch error:", e);
        setData(prev => ({ 
          ...prev, 
          loading: false, 
          error: "Gagal memuat data dashboard. Sila semak konsol." 
        }));
      }
    }
    loadData();
  }, []);
  return data;
}

// ---------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------

export default function GuruDashboard() {
  const { loading, error, currentUserName, assignedClasses, cerapan } = useGuruDashboardData();

  const statsCards = useMemo(() => [
    {
      title: "Jumlah Kelas",
      value: assignedClasses,
      icon: GraduationCap,
      color: "#1976d2", // Blue
    },
    {
      title: "Cerapan Perlu Dibuat",
      value: cerapan,
      icon: FileText,
      color: "#d32f2f", // Red (Danger)
    },
  ], [assignedClasses, cerapan]);


  if (loading) {
    return (
      <Box sx={{ p: 3, maxWidth: "xl", mx: "auto", minHeight: "60vh", display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
            <GridView color="primary" fontSize="large"/> Guru Dashboard
          </Typography>
          <Typography color="text.secondary" variant="h6">
            Selamat datang, <span className="font-bold text-primary-main">{currentUserName}</span>!
          </Typography>
        </Box>

        {/* Summary Cards */}
        {/* 保持 4 列网格以保持整洁，但只展示 3 个核心数据 + 1 个状态数据 */}
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
        
        {/* Tugas Harian / Pending Tasks - 简化 */}
        <div className="p-5 bg-white shadow rounded-lg">
            <h2 className="font-semibold text-lg mb-4">Tugas Harian (Pending)</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between border-b pb-2">
                <CalendarToday color={cerapan > 0 ? "error" : "success"} sx={{ mr: 1 }} fontSize="small" />
                <span>Cerapan Kendiri Perlu Disiapkan:</span>
                <span className={`font-bold ${cerapan > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {cerapan > 0 ? `${cerapan} penilaian` : 'Selesai'}
                </span>
              </li>
              {/* ❌ 移除 Semakan Tugasan Menunggu */}
              <li className="flex justify-between border-b pb-2">
                <UserIcon color="#1976d2" size={20} style={{ marginRight: 8 }} />
                <span>Kehadiran Perlu Dikemaskini:</span>
                <span className="font-bold text-blue-600">Hari ini</span>
              </li>
              {/* ❌ 移除 RPH Perlu Dibuat (如果您想保留，可以加回来，但您要求只保留 Cerapan 和 Kedatangan) */}
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