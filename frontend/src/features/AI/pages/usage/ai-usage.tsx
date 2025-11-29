import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

interface UsageItem {
  _id: string;
  module: string;
  model: string;
  userId: string;
  timestamp: string;
}

export default function AiUsageAnalytics() {
  const [usage, setUsage] = useState<UsageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/ai/usage")
      .then(async (res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then((data) => setUsage(data))
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
      <Typography variant="h5" fontWeight={600}>
        AI Usage Analytics
      </Typography>

      {usage.map((u) => (
        <Card key={u._id}>
          <CardContent>
            <Typography variant="h6">{u.module}</Typography>

            <Typography variant="body2" color="text.secondary">
              Model: {u.model}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              User: {u.userId}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {new Date(u.timestamp).toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
