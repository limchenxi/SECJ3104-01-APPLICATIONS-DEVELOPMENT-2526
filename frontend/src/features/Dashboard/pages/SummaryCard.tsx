import { Card, CardContent, Stack, Typography } from "@mui/material";

interface SummaryCardProps {
  label: string;
  value: number | string;
  trend?: number;
}

export default function SummaryCard({
  label,
  value,
  trend,
}: SummaryCardProps) {
  const trendText =
    typeof trend === "number" ? `${Math.abs(trend)}%` : undefined;
  const trendPrefix =
    typeof trend === "number" ? (trend >= 0 ? "+" : "-") : undefined;

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h5">{value}</Typography>
          {trendText ? (
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              color={trend >= 0 ? "success.main" : "error.main"}
            >
              <Typography variant="caption">
                {trendPrefix}
                {trendText}
              </Typography>
            </Stack>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
