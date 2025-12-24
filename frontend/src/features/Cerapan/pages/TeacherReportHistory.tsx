import React, { useState, useEffect } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Stack,
    Button,
    CircularProgress,
    Alert,
    useTheme,
    Chip,
    Divider,
} from "@mui/material";
import { ArrowLeft, BookOpen, Clock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getMyReports } from "../api/cerapanService"; // 对应后端 /cerapan/my-reports
import type { CerapanRecord } from "../type";

const getStatusChip = (status: string) => {
    switch (status) {
        case 'marked':
            return { label: 'Selesai (Marked)', color: 'success' as const, icon: <CheckCircle size={16} /> };
        case 'pending_observation_1':
        case 'pending_observation_2':
            return { label: 'Dalam Proses', color: 'warning' as const, icon: <Clock size={16} /> };
        default:
            return { label: status, color: 'default' as const, icon: null };
    }
};

export default function TeacherReportHistory() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [reports, setReports] = useState<CerapanRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        try {
            setLoading(true);
            // 调用后端的 /cerapan/my-reports 接口
            const data = await getMyReports();
            setReports(data || []);
        } catch (err) {
            console.error("Error loading reports:", err);
            setError('Gagal memuatkan sejarah laporan. Sila cuba lagi.');
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

    return (
        <Box sx={{ maxWidth: "lg", mx: "auto", p: 4 }}>
            <Stack spacing={3}>
                <Button
                    startIcon={<ArrowLeft />}
                    onClick={() => navigate('/cerapan')}
                    sx={{ width: 'fit-content' }}
                >
                    Kembali ke Dashboard Kendiri
                </Button>

                <Typography variant="h4">
                    Sejarah Laporan Cerapan
                </Typography>

                {error && <Alert severity="error">{error}</Alert>}
                <Divider />

                {reports.length === 0 ? (
                    <Alert severity="info">
                        Tiada laporan penilaian yang ditemui.
                    </Alert>
                ) : (
                    <Stack spacing={2}>
                        {reports.map((report) => {
                            const statusInfo = getStatusChip(report.status);
                            return (
                                <Card key={report._id} variant="outlined">
                                    <CardContent>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">

                                            {/* 左侧：报告信息 (Subject, Class, Period) */}
                                            <Stack spacing={1}>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                        Mata Pelajaran
                                                    </Typography>
                                                    <Typography variant="body1" fontWeight={600}>
                                                        {report.subject}
                                                    </Typography>
                                                </Box>

                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                        Kelas
                                                    </Typography>
                                                    <Typography variant="body1" fontWeight={600}>
                                                        {report.class}
                                                    </Typography>
                                                </Box>

                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                        Tempoh
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {report.period}
                                                    </Typography>
                                                </Box>
                                                <Chip
                                                    label={statusInfo.label}
                                                    color={statusInfo.color}
                                                    size="small"
                                                    icon={statusInfo.icon}
                                                    sx={{ width: 'fit-content', mt: 1 }}
                                                />
                                            </Stack>

                                            {/* 右侧：查看按钮 */}
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => navigate(`/cerapan/results/${report._id}`)} // 跳转到最终报告页
                                                startIcon={<BookOpen size={18} />}
                                            >
                                                Lihat Laporan
                                            </Button>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </Stack>
                )}
            </Stack>
        </Box>
    );
}