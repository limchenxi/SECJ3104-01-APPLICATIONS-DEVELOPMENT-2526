import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import type { AIUsage } from "../../type";
import { getUsageColor, preprocessUsageData } from "./preprocess";
import { PieChart, LineChart } from '@mui/x-charts';

export default function AiUsageAnalytics() {
  const [usage, setUsage] = useState<AIUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { pieData, lineData } = preprocessUsageData(usage);
  
  useEffect(() => {
    fetch("/api/ai/usage")
      .then(async (res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then((data:AIUsage[]) => setUsage(data))
      .catch(() => setError("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Stack alignItems="center" mt={4}>
        <CircularProgress />
      </Stack>
    );
  }

  if (error) {
    return (
      <Typography color="error" mt={2} textAlign="center">
        {error}
      </Typography>
    );
  }

  if (!usage.length) {
    return (
      <Typography mt={2} color="text.secondary" textAlign="center">
        No usage data yet.
      </Typography>
    );
  }

  return (
    
    <Stack spacing={2}>
      {/* 🌟 统计图表区域 🌟 */}
      {/* ──────────────────────────────────────────────── */}
      <Typography variant="h6" fontWeight="bold">
        Total Usage Overview
      </Typography>
      
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        {/* 1. 饼图 (Pie Chart): 各 AI Type 用量占比 */}
        {pieData.length > 0 && (
            <Card variant="outlined" sx={{ p: 2, flex: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                    Usage Distribution by Type
                </Typography>
                {/* ⚠️ PieChart 组件 */}
                <Box sx={{ height: 300, width: '100%' }}>
                  {/* 替换占位符 */}
                  <PieChart
                    series={[
                      { 
                        data: pieData, 
                        outerRadius: 100,
                        // 确保每个数据点都使用预处理中定义的颜色
                        arcLabel: (item) => `${item.label} (${item.value})`, 
                        arcLabelMinAngle: 30, // 避免标签拥挤
                      }
                    ]}
                    height={250}
                    // 调整边距以容纳图例
                    slotProps={{
                      legend: {
                          direction: 'column',
                          position: { vertical: 'middle', horizontal: 'right' },
                          padding: 0,
                      },
                    }}
                  />
                </Box>
            </Card>
        )}
        
        {/* 2. 时间线图 (Line Chart): 总用量趋势 */}
        {lineData.length > 0 && (
            <Card variant="outlined" sx={{ p: 2, flex: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                    Total Daily Usage Trend
                </Typography>
                {/* ⚠️ 占位符: 替换为实际的 LineChart 组件 */}
                <Box sx={{ height: 250, width: '100%' }}>
                  <LineChart
                    // X轴使用日期字符串作为数据
                    xAxis={[{ 
                        data: lineData.map(d => new Date(d.date)), 
                        scaleType: 'time',
                        label: 'Date',
                    }]}
                    series={[{ 
                        data: lineData.map(d => d.count), 
                        label: 'Total Runs',
                        area: true, // 填充区域使趋势更明显
                    }]}
                    height={250}
                    margin={{ top: 10, bottom: 40, left: 40, right: 10 }}
                   />
                </Box>
            </Card>
        )}
    </Stack>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
        Analitik Penggunaan AI
      </Typography>

      {usage.map((u) => (
        <Card key={u._id} variant="outlined">
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              {/* 1. Usage Type (Module) - 使用 Chip 高亮 */}
              <Chip
                label={u.usageType}
                color={getUsageColor(u.usageType)}
                size="small"
                sx={{ fontWeight: 600 }}
              />
              
              {/* 3. Timestamp */}
              <Typography variant="caption" color="text.secondary">
                {new Date(u.createdAt).toLocaleString()}
              </Typography>
            </Stack>
            
            <Box mt={1}>
              {/* 2. User ID */}
              <Typography variant="subtitle1">
                User: <span style={{ fontWeight: 600 }}>{u.userId}</span>
              </Typography>

              {/* Model 信息 (可选，但有助于调试) */}
              <Typography variant="body2" color="text.secondary">
                Model: {u.model}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ))}
      
    </Stack>
  );
}
