import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  TextField,
  Stack,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Calendar, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ScheduleObservationModal from "../components/ScheduleObservationModal";
import type {
  ObservationSchedule,
  ScheduleFormData,
  ScheduleStatus,
} from "../types/schedule";
import { backendClient } from "../../../utils/axios-client";
import { startEvaluation } from "../../Cerapan/api/cerapanService";

const getStatusColor = (status: ScheduleStatus) => {
  switch (status) {
    case "Belum Dijadualkan":
      return "default";
    case "Dijadualkan":
      return "primary";
    case "Selesai":
      return "success";
    default:
      return "default";
  }
};

export default function ScheduleObservation() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<ObservationSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<ObservationSchedule | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const client = backendClient();
      const response = await client.get<any[]>("/users");
      
      // Filter only teachers (GURU role)
      const teachers = response.data.filter((user: any) => user.role === "GURU");
      
      // Fetch all evaluations to match with teachers
      let evaluations: any[] = [];
      try {
        const evalResponse = await client.get("/cerapan/admin/tasks");
        evaluations = evalResponse.data || [];
      } catch (err) {
        console.log("No evaluations found or error fetching tasks");
      }
      
      // Transform to schedule format
      const teacherSchedules: ObservationSchedule[] = teachers.map((teacher: any) => {
        // Find the most recent evaluation for this teacher
        const teacherEval = evaluations
          .filter((e: any) => e.teacherId === teacher._id)
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        
        if (teacherEval) {
          // Map status to our schedule status
          let scheduleStatus: ScheduleStatus = "Dijadualkan";
          if (teacherEval.status === "completed") {
            scheduleStatus = "Selesai";
          }
          
          // Determine observation type based on status
          let observationType: "Cerapan 1" | "Cerapan 2" = "Cerapan 1";
          if (teacherEval.status === "pending_observation_2" || teacherEval.status === "completed") {
            observationType = "Cerapan 2";
          }
          
          return {
            id: teacher._id,
            evaluationId: teacherEval._id,
            teacherId: teacher._id,
            teacherName: teacher.name,
            subject: teacherEval.subject || teacher.subjects?.[0] || "-",
            class: teacherEval.class || teacher.classes?.[0] || "-",
            subjectOptions: Array.isArray(teacher.subjects) ? teacher.subjects : [],
            classOptions: Array.isArray(teacher.classes) ? teacher.classes : [],
            observationType: observationType,
            scheduledDate: teacherEval.period || null,
            scheduledTime: null,
            observerName: "",
            templateRubric: "",
            notes: "",
            status: scheduleStatus,
            createdAt: teacherEval.createdAt || new Date().toISOString(),
            updatedAt: teacherEval.updatedAt || new Date().toISOString(),
          };
        }
        
        return {
          id: teacher._id,
          teacherId: teacher._id,
          teacherName: teacher.name,
          subject: teacher.subjects?.[0] || "-",
          class: teacher.classes?.[0] || "-",
          subjectOptions: Array.isArray(teacher.subjects) ? teacher.subjects : [],
          classOptions: Array.isArray(teacher.classes) ? teacher.classes : [],
          observationType: null,
          scheduledDate: null,
          scheduledTime: null,
          observerName: "",
          templateRubric: "",
          notes: "",
          status: "Belum Dijadualkan",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });
      
      setSchedules(teacherSchedules);
      setError("");
    } catch (err) {
      console.error("Error loading teachers:", err);
      setError("Gagal memuatkan senarai guru.");
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = (schedule: ObservationSchedule) => {
    setSelectedTeacher(schedule);
    setModalOpen(true);
  };

  const handleSaveSchedule = async (formData: ScheduleFormData) => {
    if (!selectedTeacher) return;

    try {
      // Get the template ID from the backend
      const client = backendClient();
      const templatesRes = await client.get("/pentadbir/templates");
      const templates = templatesRes.data;
      
      // Find the template by name
      const template = templates.find((t: any) => t.name === formData.templateRubric);
      if (!template) {
        setError("Template rubrik tidak dijumpai.");
        return;
      }

      // Create evaluation using the API
      const record = await startEvaluation({
        teacherId: selectedTeacher.teacherId,
        templateId: template._id,
        period: `${formData.scheduledDate} ${formData.scheduledTime}`,
        subject: formData.subject,
        class: formData.class,
      });

      // Update local state
      setSchedules((prev) =>
        prev.map((s) =>
          s.id === selectedTeacher.id
            ? {
                ...s,
                evaluationId: record._id,
                observationType: formData.observationType,
                scheduledDate: formData.scheduledDate,
                scheduledTime: formData.scheduledTime,
                subject: formData.subject,
                class: formData.class,
                observerName: formData.observerName,
                templateRubric: formData.templateRubric,
                notes: formData.notes,
                status: "Dijadualkan",
                updatedAt: new Date().toISOString(),
              }
            : s
        )
      );

      setModalOpen(false);
      setError("");
    } catch (err) {
      console.error("Error creating evaluation:", err);
      setError("Gagal menjadualkan cerapan. Sila cuba lagi.");
    }
  };

  const filteredSchedules = schedules.filter(
    (s) =>
      s.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredByStatus = 
    activeTab === 0 ? filteredSchedules :
    activeTab === 1 ? filteredSchedules.filter(s => s.status === "Belum Dijadualkan") :
    activeTab === 2 ? filteredSchedules.filter(s => s.status === "Dijadualkan") :
    filteredSchedules.filter(s => s.status === "Selesai");

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">Jadualkan Cerapan Guru</Typography>
        <Button
          variant="outlined"
          startIcon={<Calendar size={20} />}
          onClick={() => setActiveTab(activeTab === 0 ? 2 : 0)}
        >
          {activeTab === 0 ? "Lihat Kalendar" : "Lihat Senarai"}
        </Button>
      </Stack>

      <Card sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              placeholder="Cari guru atau subjek..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: <Search size={20} style={{ marginRight: 8 }} />,
              }}
            />
          </Stack>
        </Box>

        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label={`Semua (${filteredSchedules.length})`} />
          <Tab label={`Belum Dijadualkan (${filteredSchedules.filter(s => s.status === "Belum Dijadualkan").length})`} />
          <Tab label={`Dijadualkan (${filteredSchedules.filter(s => s.status === "Dijadualkan").length})`} />
          <Tab label={`Selesai (${filteredSchedules.filter(s => s.status === "Selesai").length})`} />
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Nama Guru</strong></TableCell>
                <TableCell><strong>Subjek</strong></TableCell>
                <TableCell><strong>Kelas</strong></TableCell>
                <TableCell><strong>Jenis Cerapan</strong></TableCell>
                <TableCell><strong>Tarikh</strong></TableCell>
                <TableCell><strong>Masa</strong></TableCell>
                <TableCell><strong>Guru Pemerhati</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Tindakan</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredByStatus.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      Tiada rekod dijumpai
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredByStatus.map((schedule) => (
                  <TableRow key={schedule.id} hover>
                    <TableCell>{schedule.teacherName}</TableCell>
                    <TableCell>{schedule.subject}</TableCell>
                    <TableCell>{schedule.class}</TableCell>
                    <TableCell>
                      {schedule.observationType || "-"}
                    </TableCell>
                    <TableCell>
                      {schedule.scheduledDate
                        ? new Date(schedule.scheduledDate).toLocaleDateString("ms-MY", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </TableCell>
                    <TableCell>{schedule.scheduledTime || "-"}</TableCell>
                    <TableCell>{schedule.observerName || "-"}</TableCell>
                    <TableCell>
                      <Chip
                        label={schedule.status}
                        color={getStatusColor(schedule.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        {schedule.status !== "Selesai" && (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleSchedule(schedule)}
                          >
                            {schedule.status === "Belum Dijadualkan" ? "Jadualkan" : "Ubah"}
                          </Button>
                        )}
                        {schedule.status === "Dijadualkan" && schedule.evaluationId && (
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => {
                              const typeParam = schedule.observationType === "Cerapan 2" ? 2 : 1;
                              navigate(`/pentadbir/observation/${schedule.evaluationId}?type=${typeParam}`);
                            }}
                          >
                            Mula {schedule.observationType || "Cerapan 1"}
                          </Button>
                        )}
                        {schedule.status === "Selesai" && schedule.evaluationId && (
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            onClick={() => navigate(`/cerapan/results/${schedule.evaluationId}`)}
                          >
                            Lihat Analisis
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <ScheduleObservationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        teacherName={selectedTeacher?.teacherName || ""}
        subjectOptions={selectedTeacher?.subjectOptions || []}
        classOptions={selectedTeacher?.classOptions || []}
        initialData={selectedTeacher ? {
          observationType: selectedTeacher.observationType || "Cerapan 1",
          scheduledDate: selectedTeacher.scheduledDate || "",
          scheduledTime: selectedTeacher.scheduledTime || "",
          subject: selectedTeacher.subject || "",
          class: selectedTeacher.class || "",
          observerName: selectedTeacher.observerName || "",
          templateRubric: selectedTeacher.templateRubric || "",
          notes: selectedTeacher.notes || "",
        } : undefined}
        onSave={handleSaveSchedule}
      />
    </Box>
  );
}
