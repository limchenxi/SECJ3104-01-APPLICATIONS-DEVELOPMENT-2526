import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  useTheme,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";
import { ClipboardList, Users, BookOpen, Calendar, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAdminTasks } from "../api/cerapanService";
import type { CerapanRecord, ReportSummary } from "../type";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminCerapanDashboard() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [tabValue, setTabValue] = useState(0);
  const [tasks, setTasks] = useState<CerapanRecord[]>([]);
  const [summaries, setSummaries] = useState<Record<string, ReportSummary>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await getAdminTasks();
      setTasks(data);
      // Fetch summaries for each task
      const summaryResults: Record<string, ReportSummary> = {};
      await Promise.all(
        data.map(async (task) => {
          try {
            const res = await import("../api/cerapanService");
            const { getAdminReportSummary } = res;
            const result = await getAdminReportSummary(task._id);
            summaryResults[task._id] = result.summary;
          } catch (e) {
            // Ignore errors for individual tasks
          }
        })
      );
      setSummaries(summaryResults);
    } catch (err) {
      console.error("Error loading tasks:", err);
      setError("Gagal memuatkan tugasan. Sila cuba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleObserve = (taskId: string, observationType: 1 | 2) => {
    navigate(`/cerapan/admin/observation/${taskId}?type=${observationType}`);
  };

  // Filter tasks by observation type
  const observation1Tasks = tasks.filter((t) => t.status === "pending_observation_1");
  const observation2Tasks = tasks.filter((t) => t.status === "pending_observation_2");

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: "xl", mx: "auto" }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box>
          <Typography variant="h4" component="h1" sx={{ color: theme.palette.grey[900], mb: 0.5 }}>
            Dashboard Cerapan Pentadbir
          </Typography>
          <Typography color="text.secondary">
            Senarai tugasan cerapan yang perlu diselesaikan
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Summary Cards */}
        <Grid container spacing={3}>
          <Grid size={12}>
            <Card raised sx={{ border: `1px solid ${theme.palette.info.light}` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      bgcolor: theme.palette.info.light,
                      p: 2,
                      borderRadius: 2,
                    }}
                  >
                    <ClipboardList size={32} style={{ color: theme.palette.info.dark }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ color: theme.palette.info.dark }}>
                      {observation1Tasks.length}
                    </Typography>
                    <Typography color="text.secondary">Cerapan 1 Pending</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={12}>
            <Card raised sx={{ border: `1px solid ${theme.palette.success.light}` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      bgcolor: theme.palette.success.light,
                      p: 2,
                      borderRadius: 2,
                    }}
                  >
                    <ClipboardList size={32} style={{ color: theme.palette.success.dark }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ color: theme.palette.success.dark }}>
                      {observation2Tasks.length}
                    </Typography>
                    <Typography color="text.secondary">Cerapan 2 Pending</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab
              label={`Cerapan 1 (${observation1Tasks.length})`}
              icon={<Chip label={observation1Tasks.length} size="small" color="info" />}
              iconPosition="end"
            />
            <Tab
              label={`Cerapan 2 (${observation2Tasks.length})`}
              icon={<Chip label={observation2Tasks.length} size="small" color="success" />}
              iconPosition="end"
            />
          </Tabs>
        </Box>

        {/* Observation 1 Tasks */}
        <TabPanel value={tabValue} index={0}>
          {observation1Tasks.length === 0 ? (
            <Alert severity="info">Tiada tugasan Cerapan 1 yang perlu diselesaikan.</Alert>
          ) : (
            <Stack spacing={2}>
              {observation1Tasks.map((task) => (
                <Card key={task._id} variant="outlined">
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid size={12}>
                        <Stack spacing={1}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Users size={18} style={{ color: theme.palette.primary.main }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              Guru ID: {task.teacherId}
                            </Typography>
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <BookOpen size={16} style={{ color: theme.palette.grey[600] }} />
                            <Typography variant="body2" color="text.secondary">
                              {task.subject} - {task.class}
                            </Typography>
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Calendar size={16} style={{ color: theme.palette.grey[600] }} />
                            <Typography variant="body2" color="text.disabled">
                              Tempoh: {task.period}
                            </Typography>
                          </Stack>
                          {/* Show computed status from summary */}
                          {summaries[task._id] && (
                            <Chip
                              label={summaries[task._id].selfEvaluation.status === "submitted" ? "Kendiri Selesai" : "Kendiri Belum"}
                              size="small"
                              color={summaries[task._id].selfEvaluation.status === "submitted" ? "success" : "default"}
                              sx={{ width: "fit-content" }}
                            />
                          )}
                        </Stack>
                      </Grid>
                      <Grid size={12} sx={{ textAlign: "right" }}>
                        <Button
                          variant="contained"
                          startIcon={<Eye size={18} />}
                          onClick={() => handleObserve(task._id, 1)}
                          sx={{
                            bgcolor: theme.palette.info.main,
                            "&:hover": { bgcolor: theme.palette.info.dark },
                          }}
                        >
                          Buat Cerapan 1
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </TabPanel>

        {/* Observation 2 Tasks */}
        <TabPanel value={tabValue} index={1}>
          {observation2Tasks.length === 0 ? (
            <Alert severity="info">Tiada tugasan Cerapan 2 yang perlu diselesaikan.</Alert>
          ) : (
            <Stack spacing={2}>
              {observation2Tasks.map((task) => (
                <Card key={task._id} variant="outlined">
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid size={12}>
                        <Stack spacing={1}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Users size={18} style={{ color: theme.palette.primary.main }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              Guru ID: {task.teacherId}
                            </Typography>
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <BookOpen size={16} style={{ color: theme.palette.grey[600] }} />
                            <Typography variant="body2" color="text.secondary">
                              {task.subject} - {task.class}
                            </Typography>
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Calendar size={16} style={{ color: theme.palette.grey[600] }} />
                            <Typography variant="body2" color="text.disabled">
                              Tempoh: {task.period}
                            </Typography>
                          </Stack>
                          <Chip
                            label="Cerapan 1 Selesai"
                            size="small"
                            sx={{
                              bgcolor: theme.palette.success.light,
                              color: theme.palette.success.dark,
                              width: "fit-content",
                            }}
                          />
                        </Stack>
                      </Grid>
                      <Grid size={12} sx={{ textAlign: "right" }}>
                        <Button
                          variant="contained"
                          startIcon={<Eye size={18} />}
                          onClick={() => handleObserve(task._id, 2)}
                          sx={{
                            bgcolor: theme.palette.success.main,
                            "&:hover": { bgcolor: theme.palette.success.dark },
                          }}
                        >
                          Buat Cerapan 2
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </TabPanel>
      </Stack>
    </Box>
  );
}
