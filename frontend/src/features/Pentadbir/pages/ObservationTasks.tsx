import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Stack,
} from "@mui/material";
import { ClipboardCheck, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAdminTasks } from "../../Cerapan/api/cerapanService";
import type { CerapanRecord } from "../../Cerapan/type";
import { userApi } from "../../Users/api";

export default function ObservationTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<CerapanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [usersError, setUsersError] = useState("");

  useEffect(() => {
    loadTasks();
    loadUsers();
  }, []);
  const loadUsers = async () => {
    try {
      const users = await userApi.getAll();
      const map: Record<string, string> = {};
      users.forEach(u => { if (u._id) map[u._id] = u.name; });
      setUserMap(map);
    } catch (err) {
      console.error("Error loading users:", err);
      setUsersError("Gagal memuatkan nama guru.");
    }
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await getAdminTasks();
      setTasks(data);
    } catch (err) {
      console.error("Error loading tasks:", err);
      setError("Gagal memuatkan senarai tugasan.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending_observation_1":
        return { label: "Perlu Cerapan 1", color: "warning" as const, type: 1 };
      case "pending_observation_2":
        return { label: "Perlu Cerapan 2", color: "info" as const, type: 2 };
      default:
        return { label: status, color: "default" as const, type: 1 };
    }
  };

  const handleViewTask = (taskId: string, observationType: number) => {
    navigate(`/pentadbir/observation/${taskId}?type=${observationType}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <ClipboardCheck size={32} />
        <Typography variant="h4">Tugasan Cerapan</Typography>
      </Box>

      {(error || usersError) && (
        <Stack sx={{ mb: 3 }} gap={1}>
          {error && (
            <Alert severity="error">{error}</Alert>
          )}
          {usersError && (
            <Alert severity="warning">{usersError}</Alert>
          )}
        </Stack>
      )}

      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Senarai Cerapan Perlu Dilengkapkan</Typography>
            <Chip
              label={`${tasks.length} Tugasan`}
              color="primary"
              variant="outlined"
            />
          </Stack>

          {tasks.length === 0 ? (
            <Alert severity="info">Tiada tugasan cerapan untuk masa ini.</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Nama Guru</strong></TableCell>
                    <TableCell><strong>Tempoh</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell align="center"><strong>Tindakan</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasks.map((task) => {
                    const statusInfo = getStatusInfo(task.status);
                    const isScheduled = !!(task.scheduledDate && task.scheduledTime);
                    return (
                      <TableRow key={task._id}>
                        <TableCell>{userMap[task.teacherId] || task.teacherId}</TableCell>
                        <TableCell>{task.period}</TableCell>
                        <TableCell>
                          <Chip
                            label={statusInfo.label}
                            color={statusInfo.color}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant={isScheduled ? "contained" : "outlined"}
                            color={isScheduled ? "primary" : "inherit"}
                            size="small"
                            startIcon={isScheduled ? <Eye size={16} /> : undefined}
                            disabled={!isScheduled}
                            onClick={() => isScheduled && handleViewTask(task._id, statusInfo.type)}
                          >
                            {isScheduled ? "Buat Cerapan" : "Belum Dijadualkan"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
