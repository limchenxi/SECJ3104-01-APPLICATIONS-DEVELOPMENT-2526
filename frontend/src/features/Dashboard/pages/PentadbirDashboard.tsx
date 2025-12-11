import React, { useEffect, useMemo, useState } from "react";
import { GridView } from "@mui/icons-material";
import { Alert, Box, Card, CardContent, CircularProgress, Stack, Typography } from "@mui/material";
import { BookOpen, ClipboardCheck, Users, AlertCircle, LayoutTemplate } from "lucide-react";
import type { User } from "../../Users/type";
import type { AIUsage } from "../../AI/type";
import { userApi } from "../../Users/api";
import { TeachingAssignmentAPI } from "../../TeachingAssignment/api";


// ---------------------------------------------------------------
// 辅助组件 (StatCard, QuickAction) - 复用 Superadmin 的样式
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
// 增强的 Data Fetching and Calculation Hook (包含 Cerapan 模拟数据)
// ---------------------------------------------------------------

// 为了 Pentadbir Dashboard，我们需要 Cerapan 统计数据
function usePentadbirDashboardData() {
  const [data, setData] = useState({
    users: [] as User[],
    aiUsage: [] as AIUsage[],
     assignments: [] as any[], // 存储完整的 assignments 列表
     loading: true,
     error: null as string | null,
  });

  useEffect(() => {
    async function loadData() {
    try {
      const usersPromise = userApi.getAll();
      const assignmentsPromise = TeachingAssignmentAPI.getAll(); 

        const cerapanStatsPromise = new Promise(resolve => 
             setTimeout(() => resolve({ total: 45, pending: 8 }), 500)
        );

      const [users, assignmentsData, cerapanStats] = await Promise.all([
        usersPromise,
        assignmentsPromise,
        cerapanStatsPromise,
      ]);

      setData(prev => ({ 
        ...prev, 
        users,
        assignments: assignmentsData, // 存储完整数组
        cerapanStats: cerapanStats as any, // 存储 Cerapan 统计
        loading: false 
       }));

      } catch (e) {
        console.error("Dashboard data fetch error:", e);
        setData(prev => ({ 
          ...prev, 
          loading: false, 
          error: "Gagal memuat data dashboard. Sila semak konsol." 
        }));
       }
    }
    loadData();
  }, []);

  const summary = useMemo(() => {
    const totalUsers = data.users.length;
    let guruCount = 0;
    let pentadbirCount = 0; // 仅 PENTADBIR

    data.users.forEach(user => {
      if (user.role === "GURU") {
        guruCount++;
      } else if (user.role === "PENTADBIR" || user.role === "SUPERADMIN") {
        pentadbirCount++;
      }
    });
    
    // 从模拟数据中获取 Cerapan 统计
    const totalCerapan = (data as any).cerapanStats?.total || 0;
    const pendingReviews = (data as any).cerapanStats?.pending || 0;


    return {
      totalUsers: totalUsers.toLocaleString(),
      guruActive: guruCount.toLocaleString(), 
      pentadbir: pentadbirCount.toLocaleString(),
      totalAssignments: data.assignments.length.toLocaleString(),
      totalCerapan: totalCerapan.toLocaleString(),
      pendingReviews: pendingReviews.toLocaleString(),
      // 保持 AI GENS 字段 (如果 Superadmin 也使用了这个 hook，尽管这里是 0)
      totalAIGens: data.aiUsage.length.toLocaleString(), 
    };
  }, [data.users, data.assignments, (data as any).cerapanStats]);

   return { ...data, summary };
}


// ---------------------------------------------------------------
// Pentadbir Dashboard Main Component
// ---------------------------------------------------------------
export default function PentadbirDashboard() {
  // 使用 Pentadbir 专用的 Hook
  const { loading, error, summary } = usePentadbirDashboardData();

  // Pentadbir 的 Stat Cards (包含 Cerapan/Tugasan)
  const statsCards = [
    {
      title: "Jumlah Pengguna",
      value: summary.totalUsers,
      icon: Users,
      color: "#1976d2", // Blue (primary)
    },
    {
      title: "Jumlah Guru",
      value: summary.guruActive,
      icon: BookOpen,
      color: "#2e7d32", // Green (success)
    },
    {
      title: "Jumlah Tugasan", 
      value: summary.totalAssignments,
      icon: LayoutTemplate, // 更改图标以匹配 Tugasan
      color: "#ffc107", // Yellow/Amber
    },
    {
      title: "Jumlah Cerapan", 
      value: summary.totalCerapan,
      icon: ClipboardCheck,
      color: "#ed6c02", // Orange (warning)
    },
  ];

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
            <GridView color="primary" fontSize="large"/> Pentadbir Dashboard
          </Typography>
          <Typography color="text.secondary">
            Selamat datang! Berikut ialah gambaran keseluruhan tugas pengurusan.
          </Typography>
        </Box>

        {/* Summary Cards - 使用 StatCard 数组进行渲染 */}
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

        {/* Management Stats / Pending Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 bg-white shadow rounded-lg">
            <h2 className="font-semibold text-lg mb-4">Ringkasan Pengurusan</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between border-b pb-2">
                <span>Jumlah Pentadbir & Superadmin:</span>
                <span className="font-bold">{summary.pentadbir}</span>
              </li>
              <li className="flex justify-between border-b pb-2">
                <span>Tugasan Mengajar Aktif:</span>
                <span className="font-bold text-green-600">{summary.totalAssignments}</span>
              </li>
              <li className="flex justify-between border-b pb-2">
                <span>Semakan Cerapan Tertangguh:</span>
                <span className="font-bold text-red-600">{summary.pendingReviews}</span>
              </li>
            </ul>
          </div>
          
          <div className="p-5 bg-white shadow rounded-lg">
            <h2 className="font-semibold text-lg mb-4">Aktiviti Utama</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between">
                <ClipboardCheck color="#ed6c02" size={20} style={{ marginRight: 8 }} />
                <span>Pengurusan Cerapan</span>
                <a href="/pentadbir/cerapan" className="text-blue-600 font-bold hover:underline">Lihat</a>
              </li>
              <li className="flex justify-between">
                <LayoutTemplate color="#ffc107" size={20} style={{ marginRight: 8 }} />
                <span>Pengurusan Template Rubrik</span>
                <a href="/pentadbir/template-rubrik" className="text-blue-600 font-bold hover:underline">Lihat</a>
              </li>
              <li className="flex justify-between">
                <BookOpen color="#2e7d32" size={20} style={{ marginRight: 8 }} />
                <span>Pengurusan Tugasan Mengajar</span>
                <a href="/teaching-assignment" className="text-blue-600 font-bold hover:underline">Lihat</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-5 bg-white shadow rounded-lg">
          <h2 className="font-semibold text-lg mb-4">Tindakan Pantas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickAction label="Pengurusan Cerapan" to="/pentadbir/cerapan" />
            <QuickAction label="Template Rubrik" to="/pentadbir/template-rubrik" />
            <QuickAction label="Teaching Assignment" to="/teaching-assignment" />
            <QuickAction label="Profile Saya" to="/profile" />
          </div>
        </div>
      </Stack>
    </Box>
  );
}