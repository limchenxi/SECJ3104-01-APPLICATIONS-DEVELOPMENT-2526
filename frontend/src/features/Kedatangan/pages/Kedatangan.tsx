import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Stack,
  Typography,
  Select,
  MenuItem,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  Calendar as CalendarIcon, // Avoid conflict with local component
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  TrendingUp,
  Award,
} from 'lucide-react';
import { styled } from '@mui/system';

// --- MOCK DATA ---
const attendanceRecords = [
  { date: "18 Okt 2025", day: "Sabtu", status: "present", timeIn: "07:42", timeOut: "13:15", remarks: "-" },
  { date: "17 Okt 2025", day: "Jumaat", status: "present", timeIn: "07:38", timeOut: "13:20", remarks: "-" },
  { date: "16 Okt 2025", day: "Khamis", status: "present", timeIn: "07:45", timeOut: "13:10", remarks: "-" },
  { date: "15 Okt 2025", day: "Rabu", status: "late", timeIn: "08:15", timeOut: "13:25", remarks: "Kelewatan 15 minit" },
  { date: "14 Okt 2025", day: "Selasa", status: "present", timeIn: "07:40", timeOut: "13:18", remarks: "-" },
  { date: "13 Okt 2025", day: "Isnin", status: "present", timeIn: "07:35", timeOut: "13:12", remarks: "-" },
  { date: "11 Okt 2025", day: "Sabtu", status: "present", timeIn: "07:50", timeOut: "13:08", remarks: "-" },
  { date: "10 Okt 2025", day: "Jumaat", status: "present", timeIn: "07:43", timeOut: "13:22", remarks: "-" },
  { date: "09 Okt 2025", day: "Khamis", status: "mc", timeIn: "-", timeOut: "-", remarks: "Sakit demam" },
  { date: "08 Okt 2025", day: "Rabu", status: "present", timeIn: "07:38", timeOut: "13:16", remarks: "-" },
  { date: "07 Okt 2025", day: "Selasa", status: "present", timeIn: "07:47", timeOut: "13:14", remarks: "-" },
  { date: "06 Okt 2025", day: "Isnin", status: "present", timeIn: "07:41", timeOut: "13:19", remarks: "-" },
  { date: "04 Okt 2025", day: "Sabtu", status: "absent", timeIn: "-", timeOut: "-", remarks: "Urusan keluarga" },
  { date: "03 Okt 2025", day: "Jumaat", status: "present", timeIn: "07:39", timeOut: "13:11", remarks: "-" },
  { date: "02 Okt 2025", day: "Khamis", status: "present", timeIn: "07:44", timeOut: "13:17", remarks: "-" },
];

const stats = {
  totalDays: 195,
  attended: 185,
  absences: 5,
  late: 3,
  mc: 2,
  percentage: 94.9,
};

// --- STYLED COMPONENTS (Replacing complex Tailwind/custom styles) ---

// Custom styled component for the Percentage Card gradient
const PercentageCard = styled(Card)(({ theme }) => ({
  border: `1px solid ${theme.palette.info.light}`,
  background: `linear-gradient(to bottom right, ${theme.palette.info.light} 0%, ${theme.palette.common.white} 100%)`,
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

// Custom styled component for the Info Card gradient (for Hadir/Tidak Hadir/Status)
const StatCard = styled(Card)(({ theme, color }) => ({
  border: `1px solid ${color}`,
  background: `linear-gradient(to bottom right, ${color}33 0%, ${theme.palette.common.white} 100%)`, // 33 for slight opacity
  height: '100%',
}));


// --- HELPER COMPONENTS ---

// 1. Circular Progress Component (Replaced custom SVG/Tailwind)
const CircularProgress = ({ percentage }) => {
  const theme = useTheme();
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Box sx={{ position: 'relative', width: 192, height: 192, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="192" height="192" viewBox="0 0 192 192" style={{ transform: 'rotate(-90deg)' }}>
        {/* Background circle */}
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke={theme.palette.grey[200]}
          strokeWidth="12"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke={theme.palette.primary.main} // Solid color instead of complex gradient
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <Box sx={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h3" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
          {percentage}%
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Kehadiran
        </Typography>
      </Box>
    </Box>
  );
};

// 2. Status Chip Logic (Replacing getStatusBadge function)
const getStatusProps = (status, theme) => {
  switch (status) {
    case "present":
      return {
        label: "Hadir",
        color: theme.palette.success.main,
        bgcolor: theme.palette.success.light,
      };
    case "absent":
      return {
        label: "Tidak Hadir",
        color: theme.palette.error.main,
        bgcolor: theme.palette.error.light,
      };
    case "late":
      return {
        label: "Lewat",
        color: theme.palette.warning.main,
        bgcolor: theme.palette.warning.light,
      };
    case "mc":
      return {
        label: "MC",
        color: theme.palette.info.main,
        bgcolor: theme.palette.info.light,
      };
    default:
      return { label: status, color: theme.palette.grey[600], bgcolor: theme.palette.grey[100] };
  }
};


// --- MAIN COMPONENT ---
export function KedatanganPage() {
  const theme = useTheme();
  const [selectedMonth, setSelectedMonth] = useState("10-2025");

  return (
    <Box sx={{ p: 3, maxWidth: 'xl', mx: 'auto' }}>
      <Stack spacing={4}>
        {/* Page Header and Filter */}
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ color: theme.palette.grey[900], mb: 0.5 }}>
              Rekod Kedatangan Saya
            </Typography>
            <Typography color="text.secondary">
              Rekod kehadiran dan statistik peribadi
            </Typography>
          </Box>
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            size="small"
            sx={{ width: 180 }}
          >
            <MenuItem value="10-2025">Oktober 2025</MenuItem>
            <MenuItem value="09-2025">September 2025</MenuItem>
            <MenuItem value="08-2025">Ogos 2025</MenuItem>
            <MenuItem value="07-2025">Julai 2025</MenuItem>
            <MenuItem value="06-2025">Jun 2025</MenuItem>
            <MenuItem value="05-2025">Mei 2025</MenuItem>
          </Select>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3}>
          {/* Attendance Percentage Card - Col 1 */}
          <Grid item xs={12} lg={3}>
            <PercentageCard elevation={1}>
              <CardContent>
                <CircularProgress percentage={stats.percentage} />
              </CardContent>
            </PercentageCard>
          </Grid>

          {/* Stats Grid - Cols 2, 3, 4 */}
          <Grid item xs={12} lg={9}>
            <Grid container spacing={3}>
              {/* Hari Hadir Card */}
              <Grid item xs={12} md={4}>
                <StatCard color={theme.palette.success.main}>
                  <CardHeader
                    title={
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ color: theme.palette.success.main }}>
                        <CheckCircle2 size={20} />
                        <Typography variant="body1" fontWeight="bold">Hari Hadir</Typography>
                      </Stack>
                    }
                    sx={{ pb: 0 }}
                  />
                  <CardContent>
                    <Typography variant="h3" sx={{ color: theme.palette.success.main, mb: 1 }}>{stats.attended}</Typography>
                    <Typography variant="body2" color="text.secondary">daripada {stats.totalDays} hari</Typography>
                    <Stack direction="row" alignItems="center" spacing={1} mt={1.5} sx={{ color: theme.palette.success.main, fontSize: 14 }}>
                      <TrendingUp size={16} />
                      <Typography variant="body2">Cemerlang</Typography>
                    </Stack>
                  </CardContent>
                </StatCard>
              </Grid>

              {/* Ketidakhadiran Card */}
              <Grid item xs={12} md={4}>
                <StatCard color={theme.palette.error.main}>
                  <CardHeader
                    title={
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ color: theme.palette.error.main }}>
                        <XCircle size={20} />
                        <Typography variant="body1" fontWeight="bold">Ketidakhadiran</Typography>
                      </Stack>
                    }
                    sx={{ pb: 0 }}
                  />
                  <CardContent>
                    <Typography variant="h3" sx={{ color: theme.palette.error.main, mb: 1 }}>{stats.absences}</Typography>
                    <Typography variant="body2" color="text.secondary">hari tidak hadir</Typography>
                    <Stack spacing={0.5} mt={1}>
                      <Box display="flex" justifyContent="space-between" sx={{ fontSize: 14 }}>
                        <Typography variant="body2" color="text.secondary">MC:</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.info.main }}>{stats.mc} hari</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" sx={{ fontSize: 14 }}>
                        <Typography variant="body2" color="text.secondary">Lewat:</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.warning.main }}>{stats.late} kali</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </StatCard>
              </Grid>

              {/* Status Card */}
              <Grid item xs={12} md={4}>
                <StatCard color={theme.palette.secondary.main}>
                  <CardHeader
                    title={
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ color: theme.palette.secondary.main }}>
                        <Award size={20} />
                        <Typography variant="body1" fontWeight="bold">Status</Typography>
                      </Stack>
                    }
                    sx={{ pb: 0 }}
                  />
                  <CardContent>
                    <Chip
                      label="Cemerlang"
                      size="medium"
                      sx={{
                        bgcolor: theme.palette.success.main,
                        color: theme.palette.common.white,
                        fontWeight: 'bold',
                        mb: 2,
                      }}
                    />
                    <Typography variant="body2" color="text.secondary" mb={1}>Kehadiran konsisten</Typography>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ color: theme.palette.secondary.main, fontSize: 14 }}>
                      <CalendarIcon size={16} />
                      <Typography variant="body2">Rekod terkini</Typography>
                    </Stack>
                  </CardContent>
                </StatCard>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Attendance Legend */}
        <Card elevation={1}>
          <CardContent sx={{ pt: 3, display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {[
              { label: 'Hadir', color: theme.palette.success.main },
              { label: 'Tidak Hadir', color: theme.palette.error.main },
              { label: 'Lewat', color: theme.palette.warning.main },
              { label: 'MC (Medical Certificate)', color: theme.palette.info.main },
            ].map((item) => (
              <Stack key={item.label} direction="row" alignItems="center" spacing={1}>
                <Box sx={{ width: 12, height: 12, bgcolor: item.color, borderRadius: '50%' }} />
                <Typography variant="body2" color="text.secondary">{item.label}</Typography>
              </Stack>
            ))}
          </CardContent>
        </Card>

        {/* Attendance Table */}
        <Card elevation={1}>
          <CardHeader
            title={
              <Stack direction="row" alignItems="center" spacing={1}>
                <FileText size={24} sx={{ color: theme.palette.info.main }} />
                <Typography variant="h6" sx={{ color: theme.palette.grey[900], fontWeight: 'bold' }}>
                  Rekod Kehadiran
                </Typography>
              </Stack>
            }
            subheader={`Sejarah kehadiran untuk bulan ${selectedMonth === "10-2025" ? "Oktober 2025" : selectedMonth}`}
          />
          <CardContent sx={{ p: 0 }}>
            <TableContainer sx={{ border: `1px solid ${theme.palette.grey[200]}`, borderRadius: theme.shape.borderRadius }}>
              <Table aria-label="attendance records">
                <TableHead>
                  <TableRow sx={{ bgcolor: theme.palette.info.light }}>
                    <TableCell sx={{ color: theme.palette.primary.dark, fontWeight: 'bold' }}>Tarikh</TableCell>
                    <TableCell sx={{ color: theme.palette.primary.dark, fontWeight: 'bold' }}>Hari</TableCell>
                    <TableCell sx={{ color: theme.palette.primary.dark, fontWeight: 'bold' }}>Masa Masuk</TableCell>
                    <TableCell sx={{ color: theme.palette.primary.dark, fontWeight: 'bold' }}>Masa Keluar</TableCell>
                    <TableCell sx={{ color: theme.palette.primary.dark, fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ color: theme.palette.primary.dark, fontWeight: 'bold' }}>Catatan</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendanceRecords.map((record, index) => {
                    const statusProps = getStatusProps(record.status, theme);
                    return (
                      <TableRow key={index} hover>
                        <TableCell><Typography color="text.primary" fontWeight="medium">{record.date}</Typography></TableCell>
                        <TableCell><Typography color="text.secondary">{record.day}</Typography></TableCell>
                        <TableCell>
                          {record.timeIn === "-" ? (
                            <Typography color="text.disabled">-</Typography>
                          ) : (
                            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: theme.palette.info.main }}>
                              <Clock size={14} />
                              <Typography color="text.primary">{record.timeIn}</Typography>
                            </Stack>
                          )}
                        </TableCell>
                        <TableCell>
                          {record.timeOut === "-" ? (
                            <Typography color="text.disabled">-</Typography>
                          ) : (
                            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: theme.palette.info.main }}>
                              <Clock size={14} />
                              <Typography color="text.primary">{record.timeOut}</Typography>
                            </Stack>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={statusProps.label}
                            size="small"
                            sx={{
                              bgcolor: statusProps.bgcolor,
                              color: statusProps.color,
                              fontWeight: 'medium',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography color="text.secondary" fontSize="small">
                            {record.remarks === "-" ? (<span style={{ color: theme.palette.grey[400] }}>-</span>) : record.remarks}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Table Footer Stats */}
            <Box sx={{ mt: 3, p: 2, bgcolor: theme.palette.info.light, borderRadius: theme.shape.borderRadius, border: `1px solid ${theme.palette.info.main}` }}>
              <Grid container spacing={2} justifyContent="space-around" textAlign="center">
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" sx={{ color: theme.palette.info.dark, mb: 0.5 }}>Jumlah Hari</Typography>
                  <Typography variant="h5" sx={{ color: theme.palette.info.main, fontWeight: 'bold' }}>{attendanceRecords.length}</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" sx={{ color: theme.palette.success.dark, mb: 0.5 }}>Hadir</Typography>
                  <Typography variant="h5" sx={{ color: theme.palette.success.main, fontWeight: 'bold' }}>
                    {attendanceRecords.filter(r => r.status === "present").length}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" sx={{ color: theme.palette.warning.dark, mb: 0.5 }}>Lewat</Typography>
                  <Typography variant="h5" sx={{ color: theme.palette.warning.main, fontWeight: 'bold' }}>
                    {attendanceRecords.filter(r => r.status === "late").length}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" sx={{ color: theme.palette.error.dark, mb: 0.5 }}>Tidak Hadir</Typography>
                  <Typography variant="h5" sx={{ color: theme.palette.error.main, fontWeight: 'bold' }}>
                    {attendanceRecords.filter(r => r.status === "absent" || r.status === "mc").length}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
        
        {/* Additional Info Card */}
        <Card elevation={1} sx={{ border: `1px solid ${theme.palette.info.light}`, background: `linear-gradient(to right, ${theme.palette.info.light} 5%, ${theme.palette.common.white} 100%)` }}>
          <CardContent>
            <Stack direction="row" alignItems="flex-start" spacing={2}>
              <Box sx={{ width: 40, height: 40, bgcolor: theme.palette.info.light, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Clock size={20} style={{ color: theme.palette.info.main }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ color: theme.palette.grey[900], mb: 1 }}>Nota Penting</Typography>
                <Box component="ul" sx={{ listStyleType: 'disc', pl: 2, '& li': { mb: 0.5, color: theme.palette.grey[600], fontSize: 14 } }}>
                  <li>Kehadiran dikemas kini secara automatik setiap hari</li>
                  <li>Permohonan cuti perlu dibuat sekurang-kurangnya 2 hari lebih awal</li>
                  <li>Sijil cuti sakit (MC) perlu dikemukakan dalam tempoh 3 hari bekerja</li>
                  <li>Untuk sebarang pertanyaan, sila hubungi Bahagian Sumber Manusia</li>
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
