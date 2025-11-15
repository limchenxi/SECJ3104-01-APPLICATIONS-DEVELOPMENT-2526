import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Stack,
} from "@mui/material";
import { ClipboardCheck, Clock, CheckCircle, BarChart3, Calendar, Eye } from "lucide-react";
import { pentadbirService } from "../api/pentadbirService";
import { getAdminTasks } from "../../Cerapan/api/cerapanService";
import type { CerapanOverview } from "../type";
import type { CerapanRecord } from "../../Cerapan/type";
import { useNavigate } from "react-router-dom";
import ScheduleObservation from "./ScheduleObservation";

// Mock data for demonstrations
const mockCerapan1Data = [
  { id: 1, teacherName: "Cikgu Ahmad", subject: "Matematik", class: "5A", status: "Selesai", score: 85, date: "2025-11-10" },
  { id: 2, teacherName: "Cikgu Siti", subject: "Bahasa Melayu", class: "4B", status: "Dalam Progress", score: null, date: "2025-11-15" },
  { id: 3, teacherName: "Cikgu Lee", subject: "English", class: "6C", status: "Selesai", score: 92, date: "2025-11-08" },
];

const mockCerapan2Data = [
  { id: 1, teacherName: "Cikgu Raj", subject: "Sains", class: "5A", status: "Selesai", score: 88, date: "2025-11-12" },
  { id: 2, teacherName: "Cikgu Fatimah", subject: "Sejarah", class: "4A", status: "Belum Dijadualkan", score: null, date: null },
];

const mockSummaryData = {
  totalTeachers: 25,
  cerapan1Completed: 18,
  cerapan2Completed: 12,
  averageScore: 86.5,
  excellentPerformers: 8,
  needImprovement: 3,
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function OverviewTab({ overview }: { overview: CerapanOverview | null }) {
  const statsCards = [
    {
      title: "Jumlah Cerapan",
      value: overview?.totalCerapan || 0,
      icon: ClipboardCheck,
      color: "#1976d2",
    },
    {
      title: "Selesai",
      value: overview?.completed || 0,
      icon: CheckCircle,
      color: "#2e7d32",
    },
    {
      title: "Dalam Progress",
      value: overview?.pending || 0,
      icon: Clock,
      color: "#ed6c02",
    },
  ];

  return (
    <Grid container spacing={3}>
      {statsCards.map((card) => {
        const Icon = card.icon;
        return (
          <Grid key={card.title} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      {card.title}
                    </Typography>
                    <Typography variant="h4" sx={{ mt: 1 }}>
                      {card.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      bgcolor: card.color + "20",
                      borderRadius: 2,
                      p: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={32} color={card.color} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}

function CerapanTable({ data, title }: { data: any[], title: string }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Selesai": return "success";
      case "Dalam Progress": return "warning";
      case "Belum Dijadualkan": return "default";
      default: return "default";
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Nama Guru</strong></TableCell>
                <TableCell><strong>Subjek</strong></TableCell>
                <TableCell><strong>Kelas</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Markah</strong></TableCell>
                <TableCell><strong>Tarikh</strong></TableCell>
                <TableCell align="center"><strong>Tindakan</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.teacherName}</TableCell>
                  <TableCell>{row.subject}</TableCell>
                  <TableCell>{row.class}</TableCell>
                  <TableCell>
                    <Chip 
                      label={row.status} 
                      color={getStatusColor(row.status)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{row.score ? `${row.score}%` : "-"}</TableCell>
                  <TableCell>
                    {row.date ? new Date(row.date).toLocaleDateString("ms-MY") : "-"}
                  </TableCell>
                  <TableCell align="center">
                    <Button size="small" startIcon={<Eye size={16} />}>
                      Lihat
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}

function SummaryTab() {
  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Statistik Keseluruhan</Typography>
              <Stack spacing={2}>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Jumlah Guru:</Typography>
                  <Typography fontWeight="bold">{mockSummaryData.totalTeachers}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Cerapan 1 Selesai:</Typography>
                  <Typography fontWeight="bold">{mockSummaryData.cerapan1Completed}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Cerapan 2 Selesai:</Typography>
                  <Typography fontWeight="bold">{mockSummaryData.cerapan2Completed}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Purata Markah:</Typography>
                  <Typography fontWeight="bold" color="success.main">
                    {mockSummaryData.averageScore}%
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Prestasi</Typography>
              <Stack spacing={2}>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Pencapaian Cemerlang:</Typography>
                  <Chip 
                    label={`${mockSummaryData.excellentPerformers} guru`} 
                    color="success" 
                    size="small" 
                  />
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Perlu Penambahbaikan:</Typography>
                  <Chip 
                    label={`${mockSummaryData.needImprovement} guru`} 
                    color="warning" 
                    size="small" 
                  />
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Kadar Kejayaan:</Typography>
                  <Typography fontWeight="bold" color="primary.main">
                    {((mockSummaryData.totalTeachers - mockSummaryData.needImprovement) / mockSummaryData.totalTeachers * 100).toFixed(1)}%
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default function Cerapan() {
  const [overview, setOverview] = useState<CerapanOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [tasks, setTasks] = useState<CerapanRecord[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadCerapanOverview();
    // Preload tasks; alternatively, could lazy load when opening tab 4
    loadAdminTasks();
  }, []);

  const loadCerapanOverview = async () => {
    try {
      setLoading(true);
      const data = await pentadbirService.getCerapanOverview();
      setOverview(data);
    } catch (err) {
      console.error("Error loading cerapan overview:", err);
      setError("Gagal memuatkan data cerapan");
    } finally {
      setLoading(false);
    }
  };

  const loadAdminTasks = async () => {
    try {
      setTasksLoading(true);
      const list = await getAdminTasks();
      setTasks(list);
      setTasksError("");
    } catch (err) {
      console.error("Error loading admin tasks:", err);
      setTasksError("Gagal memuatkan tugasan cerapan");
    } finally {
      setTasksLoading(false);
    }
  };

  const statusInfo = (status: string) => {
    if (status === "pending_observation_1") return { label: "Perlu Cerapan 1", color: "warning" as const, type: 1 };
    if (status === "pending_observation_2") return { label: "Perlu Cerapan 2", color: "info" as const, type: 2 };
    return { label: status, color: "default" as const, type: 1 };
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Pengurusan Cerapan Pengajaran
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Gambaran Keseluruhan" icon={<BarChart3 size={16} />} />
          <Tab label="Cerapan 1" icon={<ClipboardCheck size={16} />} />
          <Tab label="Cerapan 2" icon={<CheckCircle size={16} />} />
          <Tab label="Rumusan" icon={<BarChart3 size={16} />} />
          <Tab label="Jadual Cerapan" icon={<Calendar size={16} />} />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <OverviewTab overview={overview} />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <CerapanTable data={mockCerapan1Data} title="Senarai Cerapan 1" />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <CerapanTable data={mockCerapan2Data} title="Senarai Cerapan 2" />
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <SummaryTab />
      </TabPanel>

      <TabPanel value={activeTab} index={4}>
        <ScheduleObservation />
        {/* Tugasan Cerapan removed as requested */}
      </TabPanel>
    </Box>
  );
}
