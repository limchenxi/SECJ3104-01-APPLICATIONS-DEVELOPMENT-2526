import type { AIUsage, DailyUsage, UsageCount } from "../../type";

export const preprocessUsageData = (usage: AIUsage[]): { pieData: UsageCount[], lineData: DailyUsage[] } => {
  if (!usage || usage.length === 0) {
    return { pieData: [], lineData: [] };
  }

  // 1. 饼图数据 (Pie Chart Data: 按 Usage Type 汇总)
  const typeCounts: { [key: string]: number } = {};
  const dailyCounts: { [key: string]: number } = {};
  
  usage.forEach(item => {
    // 按类型计数
    typeCounts[item.usageType] = (typeCounts[item.usageType] || 0) + 1;

    // 按日期计数 (用于时间线)
    const dateKey = new Date(item.createdAt).toISOString().split('T')[0];
    dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1;
  });

  // 转换为 Pie Chart 格式
  let id = 0;
  const pieData: UsageCount[] = Object.entries(typeCounts).map(([type, count]) => ({
    id: id++,
    value: count,
    label: type,
    color: getUsageColor(type) === 'primary' ? '#1976d2' : (getUsageColor(type) === 'secondary' ? '#9c27b0' : (getUsageColor(type) === 'warning' ? '#ed6c02' : undefined)),
  }));

  // 转换为 Line Chart 格式 (并排序)
  const lineData: DailyUsage[] = Object.entries(dailyCounts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
  return { pieData, lineData };
};


export const getUsageColor = (usageType: string) => {
  switch (usageType) {
    case "eRPH":
      return "primary";
    case "AI Quiz - Topic Quiz":
      return "secondary";
    case "AI Quiz - Flashcard":
      return "secondary";
    case "Cerapan Comment":
      return "warning";
    default:
      return "default";
  }
};
