import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
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
} from "@mui/material";
import { ClipboardCheck, CheckCircle, BarChart3, Calendar, Eye } from "lucide-react";
import { pentadbirService } from "../api/pentadbirService";
import { userApi } from "../../Users/api";
import type { UserItem } from "../../Users/stores";
import { useNavigate } from "react-router-dom";
import ScheduleObservationModal from "../components/ScheduleObservationModal";
import ObservationCard from "../components/ObservationCard";

interface EvaluationRow {
  id: string;
  teacherName: string;
  teacherId: string;
  subject: string;
  class: string;
  period: string;
  status: string;
  selfStatus: string;
  obs1Status: string;
  obs2Status: string;
  createdAt: Date;
  scheduledDate?: string;
  scheduledTime?: string;
  observerName?: string;
  templateRubric?: string;
  notes?: string;
  observationType?: string;
}

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

function OverviewTab({ evaluations, teachers, teachingAssignments }: { evaluations: EvaluationRow[], teachers: UserItem[], teachingAssignments: any[] }) {
  const navigate = useNavigate();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted": return "success";
      case "pending": return "warning";
      default: return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "submitted": return "Selesai";
      case "pending": return "Belum";
      default: return status;
    }
  };

  const handleViewReport = (evaluationId: string) => {
    navigate(`/cerapan/report/${evaluationId}`);
  };

  // Build rows for each teacher-subject-class combination
  const allRows = (() => {
    const rows: Array<{
      id: string;
      teacherName: string;
      subject: string;
      class: string;
      evaluation?: EvaluationRow;
    }> = [];

    // Get all GURU teachers
    const guruTeachers = teachers.filter(t => t.role === 'GURU');

    // Use teachingAssignments for subject/class lists
    // teachingAssignments must be available in this scope
    // @ts-ignore: teachingAssignments is available in parent scope
    guruTeachers.forEach(teacher => {
      // @ts-ignore
      const assignments = teachingAssignments.filter(a => a.teacherId === teacher._id && a.active);
      if (assignments.length === 0) {
        rows.push({
          id: `${teacher._id}-none-none`,
          teacherName: teacher.name,
          subject: '-',
          class: '-',
          evaluation: undefined
        });
      } else {
        assignments.forEach((assignment: { subject: string; class: string; teacherId: string; active: boolean }) => {
          const evaluation = evaluations.find(e => 
            e.teacherId === teacher._id && 
            e.subject === assignment.subject && 
            e.class === assignment.class
          );
          rows.push({
            id: `${teacher._id}-${assignment.subject}-${assignment.class}`,
            teacherName: teacher.name,
            subject: assignment.subject,
            class: assignment.class,
            evaluation
          });
        });
      }
    });

    return rows;
  })();

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>Gambaran Keseluruhan - Semua Guru</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Nama Guru</strong></TableCell>
                <TableCell><strong>Subjek</strong></TableCell>
                <TableCell><strong>Kelas</strong></TableCell>
                <TableCell><strong>Tempoh</strong></TableCell>
                <TableCell><strong>Kendiri</strong></TableCell>
                <TableCell><strong>Cerapan 1</strong></TableCell>
                <TableCell><strong>Cerapan 2</strong></TableCell>
                <TableCell align="center"><strong>Tindakan</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      Tiada guru dalam sistem
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                allRows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.teacherName}</TableCell>
                    <TableCell>{row.subject}</TableCell>
                    <TableCell>{row.class}</TableCell>
                    <TableCell>{row.evaluation?.period || '-'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusLabel(row.evaluation?.selfStatus || 'pending')} 
                        color={getStatusColor(row.evaluation?.selfStatus || 'pending')} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusLabel(row.evaluation?.obs1Status || 'pending')} 
                        color={getStatusColor(row.evaluation?.obs1Status || 'pending')} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusLabel(row.evaluation?.obs2Status || 'pending')} 
                        color={getStatusColor(row.evaluation?.obs2Status || 'pending')} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="center">
                      {row.evaluation ? (
                        <Button size="small" startIcon={<Eye size={16} />} onClick={() => handleViewReport(row.evaluation!.id)}>
                          Lihat
                        </Button>
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}

function CerapanTable({ data, title }: { data: EvaluationRow[], title: string }) {
  const navigate = useNavigate();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted": return "success";
      case "pending": return "warning";
      default: return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "submitted": return "Selesai";
      case "pending": return "Belum";
      default: return status;
    }
  };

  const handleViewReport = (evaluationId: string) => {
    navigate(`/pentadbir/cerapan/report/${evaluationId}`);
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
                <TableCell><strong>Tempoh</strong></TableCell>
                <TableCell><strong>Kendiri</strong></TableCell>
                <TableCell><strong>Cerapan 1</strong></TableCell>
                <TableCell><strong>Cerapan 2</strong></TableCell>
                <TableCell align="center"><strong>Tindakan</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.teacherName}</TableCell>
                  <TableCell>{row.subject}</TableCell>
                  <TableCell>{row.class}</TableCell>
                  <TableCell>{row.period}</TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusLabel(row.selfStatus)} 
                      color={getStatusColor(row.selfStatus)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusLabel(row.obs1Status)} 
                      color={getStatusColor(row.obs1Status)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusLabel(row.obs2Status)} 
                      color={getStatusColor(row.obs2Status)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                      {/* {row.obs1Status === 'pending' && title.includes('Cerapan 1') && row.scheduledDate && row.scheduledTime && ( */}
                      {(row.obs1Status === 'pending') && row.id && (
                        <Button 
                          size="small" 
                          variant="contained"
                          color="primary"
                          onClick={() => navigate(`/pentadbir/observation/${row.id}?type=1`)}
                        >
                          Mula Cerapan 1
                        </Button>
                      )}
                      {/* {row.obs2Status === 'pending' && title.includes('Cerapan 2') && row.obs1Status === 'submitted' && row.scheduledDate && row.scheduledTime && ( */}
                      {row.obs2Status === 'pending' && title.includes('Cerapan 2') && row.obs1Status === 'submitted' && row.id && (
                        <Button 
                          size="small" 
                          variant="contained"
                          color="secondary"
                          onClick={() => navigate(`/pentadbir/observation/${row.id}?type=2`)}
                        >
                          Mula Cerapan 2
                        </Button>
                      )}
                      {/* <Button size="small" startIcon={<Eye size={16} />} onClick={() => navigate(`/cerapan/report/${row.id}`)}>
                        Lihat
                      </Button> */}
                      {row.id && (
                        <Button size="small" startIcon={<Eye size={16} />} onClick={() => navigate(`/cerapan/report/${row.id}`)}>
                          Lihat
                        </Button>
                      )}
                    </Box>
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

export default function Cerapan() {
  const navigate = useNavigate();
  const [evaluations, setEvaluations] = useState<EvaluationRow[]>([]);
  const [teachers, setTeachers] = useState<UserItem[]>([]);
  const [teachingAssignments, setTeachingAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [scheduleFilter, setScheduleFilter] = useState(0); // 0: All, 1: Ready for Obs1, 2: Ready for Obs2
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<{ 
    id: string; 
    name: string; 
    subjects: string[]; 
    classes: string[]; 
    evaluationId?: string;
    evaluationData?: {
      subject: string;
      class: string;
      obs1Status: string;
    };
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [evaluationsData, teachersData, assignmentsData] = await Promise.all([
        pentadbirService.getAllEvaluations(),
        userApi.getAll(),
        import("../../TeachingAssignment/api").then(m => m.TeachingAssignmentAPI.getAll()),
      ]);
      setTeachers(teachersData);
      setTeachingAssignments(assignmentsData);
      // Map evaluations with teacher names
      const teacherMap = new Map(teachersData.map(t => [t._id, t]));
      const mappedEvaluations = evaluationsData.map(e => ({
        id: e._id,
        teacherId: e.teacherId,
        teacherName: teacherMap.get(e.teacherId)?.name || 'Unknown',
        subject: e.subject,
        class: e.class,
        period: e.period,
        status: e.status,
        selfStatus: e.self_evaluation.status,
        obs1Status: e.observation_1.status,
        obs2Status: e.observation_2.status,
        createdAt: new Date(e.createdAt),
        scheduledDate: e.scheduledDate,
        scheduledTime: e.scheduledTime,
        observerName: e.observerName,
        templateRubric: e.templateRubric,
        notes: e.notes,
        observationType: e.observationType,
      }));
      setEvaluations(mappedEvaluations);
    } catch (err) {
      console.error("Error loading cerapan data:", err);
      setError("Gagal memuatkan data cerapan");
    } finally {
      setLoading(false);
    }
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
          <Tab label="Jadual Cerapan" icon={<Calendar size={16} />} />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <OverviewTab evaluations={evaluations} teachers={teachers} teachingAssignments={teachingAssignments} />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <CerapanTable 
          data={evaluations.filter(e => 
            e.obs1Status === 'pending'|| 
            e.status === 'pending_self_evaluation')} 
          title="Cerapan 1 - Sedia untuk Pentadbir" 
        />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <CerapanTable 
          data={evaluations.filter(e => e.obs1Status === 'submitted' && e.obs2Status === 'pending')} 
          title="Cerapan 2 - Sedia untuk Pentadbir" 
        />
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Senarai Jadual Cerapan</Typography>
              
              {/* Sub-tabs for filtering */}
              <Tabs 
                value={scheduleFilter} 
                onChange={(_, newValue) => setScheduleFilter(newValue)}
                sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
              >
                <Tab label="Semua" />
                <Tab label="Sedia Cerapan 1" />
                <Tab label="Sedia Cerapan 2" />
              </Tabs>

              {/* Cards Grid */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {(() => {
                  // Build rows for each teacher-subject-class combination
                  const allRows: Array<{
                    id: string;
                    teacherName: string;
                    teacherId: string;
                    subject: string;
                    class: string;
                    evaluation?: EvaluationRow;
                  }> = [];

                  const guruTeachers = teachers.filter(t => t.role === 'GURU');

                  guruTeachers.forEach(teacher => {
                    // Get assignments for this teacher
                    const assignments = teachingAssignments.filter(a => a.teacherId === teacher._id && a.active);
                    if (assignments.length === 0) {
                      allRows.push({
                        id: `${teacher._id}-none-none`,
                        teacherName: teacher.name,
                        teacherId: teacher._id || '',
                        subject: '-',
                        class: '-',
                        evaluation: undefined
                      });
                    } else {
                      assignments.forEach(assignment => {
                        const evaluation = evaluations.find(e => 
                          e.teacherId === teacher._id && 
                          e.subject === assignment.subject && 
                          e.class === assignment.class
                        );
                        allRows.push({
                          id: `${teacher._id}-${assignment.subject}-${assignment.class}`,
                          teacherName: teacher.name,
                          teacherId: teacher._id || '',
                          subject: assignment.subject,
                          class: assignment.class,
                          evaluation
                        });
                      });
                    }
                  });

                  // Apply filter based on scheduleFilter
                  const filteredRows = allRows.filter(row => {
                    if (scheduleFilter === 0) return true; // Show all
                    
                    const obs1Status = row.evaluation?.obs1Status || 'pending';
                    const obs2Status = row.evaluation?.obs2Status || 'pending';
                    
                    if (scheduleFilter === 1) {
                      // Ready for Obs 1: obs1 is pending (no requirement for self status)
                      return obs1Status === 'pending';
                    }
                    
                    if (scheduleFilter === 2) {
                      // Ready for Obs 2: obs1 is submitted, obs2 is pending
                      return obs1Status === 'submitted' && obs2Status === 'pending';
                    }
                    
                    return false;
                  });

                  if (filteredRows.length === 0) {
                    return (
                      <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography color="text.secondary">
                          {scheduleFilter === 0 
                            ? "Tiada guru dalam sistem"
                            : scheduleFilter === 1
                            ? "Tiada guru sedia untuk Cerapan 1"
                            : "Tiada guru sedia untuk Cerapan 2"}
                        </Typography>
                      </Box>
                    );
                  }

                  return filteredRows.map((row) => {
                    // Determine observation type for display
                    const observationType: "Cerapan 1" | "Cerapan 2" = 
                      row.evaluation?.obs1Status === 'submitted' ? "Cerapan 2" : "Cerapan 1";
                    
                    // Check if scheduled
                    const isScheduled = !!(row.evaluation?.scheduledDate && row.evaluation?.scheduledTime);
                    
                    return (
                      <Box key={row.id} sx={{ mb: 2 }}>
                        <ObservationCard
                          teacherName={row.teacherName}
                          subject={row.subject}
                          className={row.class}
                          observationType={observationType}
                          observerName={row.evaluation?.observerName || "Pentadbir"}
                          observerTitle="Guru Besar"
                          rubric={row.evaluation?.templateRubric || "Cerapan PdPc 2025"}
                          date={row.evaluation?.scheduledDate ? new Date(row.evaluation.scheduledDate).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                          time={row.evaluation?.scheduledTime || '-'}
                          year={new Date().getFullYear().toString()}
                          status={isScheduled ? "Telah dijadualkan" : "Belum dijadualkan"}
                          onEdit={() => {
                            const teacher = teachers.find(t => t._id === row.teacherId);
                            console.log('Edit clicked for teacher:', teacher?.name);
                            console.log('Evaluation:', row.evaluation);
                            console.log('Evaluation ID:', row.evaluation?.id);
                            if (teacher && teacher._id && row.evaluation) {
                              // Get subjects/classes from assignments
                              const assignments = teachingAssignments.filter(a => a.teacherId === teacher._id && a.active);
                              const subjects = [...new Set(assignments.map(a => a.subject))];
                              const classes = [...new Set(assignments.map(a => a.class))];
                              setSelectedTeacher({
                                id: teacher._id,
                                name: teacher.name,
                                subjects,
                                classes,
                                evaluationId: row.evaluation?.id,
                                evaluationData: {
                                  subject: row.subject,
                                  class: row.class,
                                  obs1Status: row.evaluation.obs1Status,
                                },
                              });
                              setScheduleModalOpen(true);
                            }
                          }}
                          onDelete={() => {
                            if (row.evaluation && window.confirm(`Padam cerapan untuk ${row.teacherName}?`)) {
                              // Handle delete
                              console.log('Delete:', row.evaluation.id);
                            }
                          }}
                          onStart={() => {
                            if (row.evaluation?.id) {
                              // Navigate to observation form based on type
                              if (observationType === "Cerapan 1") {
                                navigate(`/pentadbir/observation/${row.evaluation.id}?type=1`);
                              } else {
                                navigate(`/pentadbir/observation/${row.evaluation.id}?type=2`);
                              }
                            }
                          }}
                        />
                      </Box>
                    );
                  });
                })()}
              </Box>
            </CardContent>
          </Card>
          
          {selectedTeacher && (
            <ScheduleObservationModal
              open={scheduleModalOpen}
              onClose={() => {
                setScheduleModalOpen(false);
                setSelectedTeacher(null);
              }}
              teacherName={selectedTeacher.name}
              subjectOptions={selectedTeacher.subjects}
              classOptions={selectedTeacher.classes}
              evaluationId={selectedTeacher.evaluationId}
              evaluationData={selectedTeacher.evaluationData}
              onSave={() => {
                setScheduleModalOpen(false);
                setSelectedTeacher(null);
                loadData();
              }}
            />
          )}
        </Box>
      </TabPanel>
    </Box>
  );
}
