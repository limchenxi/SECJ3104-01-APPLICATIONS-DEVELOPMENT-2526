import {
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";

export interface AttendanceTrendPoint {
  label: string;
  percentage: number;
}

interface KedatanganChartProps {
  title?: string;
  data?: AttendanceTrendPoint[];
}

const defaultData: AttendanceTrendPoint[] = [
  { label: "Isnin", percentage: 92 },
  { label: "Selasa", percentage: 94 },
  { label: "Rabu", percentage: 90 },
  { label: "Khamis", percentage: 96 },
  { label: "Jumaat", percentage: 91 },
];

export default function KedatanganChart({
  title = "Kehadiran Minggu Ini",
  data = defaultData,
}: KedatanganChartProps) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6">{title}</Typography>
          <Stack spacing={1}>
            {data.map((point) => (
              <Stack key={point.label} spacing={0.5}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">{point.label}</Typography>
                  <Typography variant="body2">{point.percentage}%</Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(Math.max(point.percentage, 0), 100)}
                />
              </Stack>
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
