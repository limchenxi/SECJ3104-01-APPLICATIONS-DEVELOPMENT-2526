import { GridView } from "@mui/icons-material";
import { Alert, Box, Card, CardContent, CircularProgress, Stack, Typography } from "@mui/material";
import type { User } from "../../Users/type";
import type { AIUsage } from "../../AI/type";
import { useEffect, useMemo, useState } from "react";
import { TeachingAssignmentAPI } from "../../TeachingAssignment/api";
import { userApi } from "../../Users/api";
import { BookOpen, ClipboardCheck, Users } from "lucide-react";

const AI_MODEL_DEFAULT = "Gemini";
const AI_MODEL_VERSION = "gemini-2.5-flash";
const AI_API_STATUS = "OK ✓";
const AI_API_STATUS_COLOR = "text-green-600";

// function SummaryCard({ title, value }) {
//   return (
//     <div className="p-5 bg-white shadow rounded-lg">
//       <p className="text-gray-500">{title}</p>
//       <p className="text-2xl font-bold">{value}</p>
//     </div>
//   );
// }

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
// Data Fetching and Calculation Hook 
// ---------------------------------------------------------------

function useDashboardData() {
  const [data, setData] = useState({
    users: [] as User[],
    aiUsage: [] as AIUsage[],
    assignments: 0,
    loading: true,
    error: null as string | null,
  });

  useEffect(() => {
    async function loadData() {
      try {
        // 1. 获取所有用户
        const usersPromise = userApi.getAll();
        
        // 2. 获取所有教学任务 (用于计算活跃度，尽管这里只计算总数)
        // 假设 TeachingAssignmentAPI 存在
        const assignmentsPromise = TeachingAssignmentAPI.getAll(); 

        // 3. 获取 AI 使用数据 (模拟调用您提供的 API)
        const usagePromise = fetch("/api/ai/usage").then(res => res.json());

        const [users, assignmentsData, aiUsage] = await Promise.all([
          usersPromise,
          assignmentsPromise,
          usagePromise,
        ]);

        setData(prev => ({ 
          ...prev, 
          users, 
          aiUsage, 
          assignments: assignmentsData.length,
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

  // 使用 useMemo 进行数据计算 (Compute Summary Data)
  const summary = useMemo(() => {
    const totalUsers = data.users.length;
    let guruCount = 0;
    let pentadbirCount = 0;
    
    data.users.forEach(user => {
      // if (user.role === "GURU") {
      //   guruCount++;
      // } else if (user.role === "PENTADBIR") {
      //   pentadbirCount++;
      // }
       const userRoles = Array.isArray(user.role) ? user.role : [];
      const isManagement = userRoles.includes("PENTADBIR");
      if (isManagement) {
        pentadbirCount++;
        }
      if (userRoles.includes("GURU") && !isManagement) {
        guruCount++;
      }
    });

    const totalAIGens = data.aiUsage.length;
    
    // 计算最受欢迎的 AI 模块
    const usageCounts = data.aiUsage.reduce((acc, item) => {
        acc[item.usageType] = (acc[item.usageType] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // 转换为数组并排序
    const popularModules = Object.entries(usageCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 3); // 只取前三名

    return {
      totalUsers: totalUsers.toLocaleString(),
      guruActive: guruCount.toLocaleString(), // 假设所有 Guru 都是活跃的
      pentadbir: pentadbirCount.toLocaleString(),
      totalAIGens: totalAIGens.toLocaleString(),
      popularModules,
    };
  }, [data.users, data.aiUsage]);

  return { ...data, summary };
}

export default function SuperadminDashboard() {
  const { loading, error, summary } = useDashboardData();
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
      title: "Jumlah Pentadbir", // 更改为 Pentadbir
      value: summary.pentadbir,
      icon: Users,
      color: "#ffc107", // Yellow/Amber
    },
    {
      title: "Jumlah AI Generations", // 更改为 AI Generations
      value: summary.totalAIGens,
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
            <GridView color="primary" fontSize="large"/> Superadmin Dashboard
          </Typography>
          <Typography color="text.secondary">
            Selamat datang! Berikut ialah gambaran keseluruhan operasi sistem.
          </Typography>
        </Box>

      {/* Summary Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard title="Jumlah Pengguna" value={summary.totalUsers} />
        <SummaryCard title="Guru Aktif" value={summary.guruActive} />
        <SummaryCard title="Pentadbir" value={summary.pentadbir} />
        <SummaryCard title="Jumlah AI Generations" value={summary.totalAIGens} />
      </div> */}
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

      {/* AI Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 bg-white shadow rounded-lg">
          <h2 className="font-semibold text-lg mb-4">Modul AI Paling Popular</h2>
          {summary.popularModules.length === 0 ? (
                <Typography color="text.secondary">Tiada data penggunaan AI.</Typography>
            ) : (
          <ul className="space-y-3">
            {summary.popularModules.map(([moduleName, count]) => (
              <li key={moduleName} className="flex justify-between border-b pb-2">
                <span>{moduleName}</span>
                <span className="font-bold">{count.toLocaleString()} kali</span>
              </li>
            ))}
          </ul>
          )}
        </div>

        <div className="p-5 bg-white shadow rounded-lg">
          <h2 className="font-semibold text-lg mb-4">Status Sistem AI</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between">
              <span>Provider (Utama):</span>
              <span className="font-bold text-blue-600">{AI_MODEL_DEFAULT}</span>
            </li>
            <li className="flex justify-between">
              <span>Model Default:</span>
              <span className="font-bold">{AI_MODEL_VERSION}</span>
            </li>
            <li className="flex justify-between">
              <span>Status API:</span>
              <span className={`${AI_API_STATUS_COLOR} font-bold`}>{AI_API_STATUS}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-5 bg-white shadow rounded-lg">
        <h2 className="font-semibold text-lg mb-4">Tindakan Pantas</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction label="Pengurusan AI" to="/ai" />
          <QuickAction label="Pengurusan Pengguna" to="/users" />
          <QuickAction label="Teaching Assignment" to="/teaching-assignment" />
          <QuickAction label="Profile" to="/profile" />
        </div>
      </div>

      {/* Recent Activities */}
      {/* <div className="p-5 bg-white shadow rounded-lg">
        <h2 className="font-semibold text-lg mb-4">Aktiviti Terkini</h2>
        <Typography color="text.secondary">
          Menunggu API Aktiviti Terkini...
        </Typography>
        <ul className="space-y-3">
          <li>- Guru <span className="font-bold">Ahmad</span> menjana AI Quiz (5 min yang lalu)</li>
          <li>- Pentadbir <span className="font-bold">Siti</span> menambah Template Rubrik</li>
          <li>- Superadmin mengubah Default Model → gpt-4.1-mini</li>
        </ul>
      </div> */}
    </Stack>
    </Box>
  );
}
