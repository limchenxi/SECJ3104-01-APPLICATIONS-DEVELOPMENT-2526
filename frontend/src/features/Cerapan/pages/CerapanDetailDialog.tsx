import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Stack,
    Chip,
    useTheme,
    IconButton,
} from "@mui/material";
import { X, Download, FileText } from "lucide-react";
import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { CerapanRecord, ObservationSection } from "../type";

interface CerapanDetailDialogProps {
    open: boolean;
    onClose: () => void;
    report: CerapanRecord;
    type: "self" | "obs1" | "obs2";
    teacherName?: string;
}

const SCHOOL_NAME = 'SK SRI SIAKAP';
const SCHOOL_LOGO_URL = "/SKSRISIAKAP.png";

export default function CerapanDetailDialog({
    open,
    onClose,
    report,
    type,
    teacherName,
}: CerapanDetailDialogProps) {
    const theme = useTheme();
    const pdfRef = useRef<HTMLDivElement>(null);
    const [downloading, setDownloading] = useState(false);

    const getTitle = () => {
        switch (type) {
            case "self":
                return "Perincian Cerapan Kendiri";
            case "obs1":
                return "Perincian Cerapan 1";
            case "obs2":
                return "Perincian Cerapan 2";
            default:
                return "Perincian";
        }
    };

    const getSectionData = (): ObservationSection => {
        switch (type) {
            case "self":
                return report.self_evaluation;
            case "obs1":
                return report.observation_1;
            case "obs2":
                return report.observation_2;
            default:
                return report.self_evaluation;
        }
    };

    const sectionData = getSectionData();
    const isSelf = type === "self";

    // Group questions by section/subcategory if possible, or just list them
    // The structure of QuestionSnapshot has categoryCode/subCategoryCode
    const questions = report.questions_snapshot || [];

    const handleDownloadPDF = async () => {
        if (!pdfRef.current) return;
        try {
            setDownloading(true);
            const input = pdfRef.current;

            // Basic Setup for PDF
            const canvas = await html2canvas(input, {
                scale: 2,
                backgroundColor: "#ffffff",
                useCORS: true,
                logging: false,
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
            const imgWidth = 210; // A4 width
            const pageHeight = 297; // A4 height
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`Perincian_${type}_${report.teacherId}.pdf`);
        } catch (error) {
            console.error("PDF Download failed", error);
            alert("Gagal memuat turun PDF.");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <FileText />
                    <Typography variant="h6">{getTitle()}</Typography>
                </Stack>
                <IconButton onClick={onClose} size="small">
                    <X />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Box ref={pdfRef} sx={{ p: 4, bgcolor: 'background.paper' }}>
                    {/* PDF Header */}
                    <Stack spacing={0} mb={4} textAlign="center" alignItems="center">
                        <img
                            src={SCHOOL_LOGO_URL}
                            alt="Logo Sekolah"
                            style={{ maxWidth: '80px', height: 'auto', display: 'block', marginBottom: 8 }}
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                        <Typography variant="h5" fontWeight="bold" fontFamily="Arial, sans-serif" sx={{ fontSize: '24px', mb: 0.5 }}>{SCHOOL_NAME}</Typography>
                        <Typography variant="h4" fontWeight="bold" sx={{ fontSize: '18pt', mb: 1 }}>TAPAK STANDARD 4</Typography>
                        <Typography variant="h4" fontWeight="bold" sx={{ fontSize: '18pt', mb: 2 }}>PEMBELAJARAN DAN PEMUDAHCARAAN (PdPc)</Typography>

                        <Typography variant="h6" sx={{ mt: 2, textDecoration: 'underline' }}>{getTitle().toUpperCase()}</Typography>

                        <Box sx={{ mt: 2, p: 2, width: '100%', border: '1px solid #ddd', borderRadius: 1, textAlign: 'left' }}>
                            <Stack direction="row" justifyContent="space-around" flexWrap="wrap" gap={2}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Nama Guru</Typography>
                                    <Typography variant="body2" fontWeight="bold">{teacherName || report.teacherId}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Mata Pelajaran</Typography>
                                    <Typography variant="body2" fontWeight="bold">{report.subject}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Kelas</Typography>
                                    <Typography variant="body2" fontWeight="bold">{report.class}</Typography>
                                </Box>
                                <Box sx={{ minWidth: 150 }}>
                                    <Typography variant="caption" color="text.secondary">Tarikh</Typography>
                                    <Typography variant="body2" fontWeight="bold">
                                        {sectionData.submittedAt ? new Date(sectionData.submittedAt).toLocaleDateString() : '-'}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>
                    </Stack>

                    <Stack spacing={3}>
                        {questions.map((q, index) => {
                            // Find answer/mark
                            let answerDisplay = <Typography color="text.secondary" fontStyle="italic">Tiada respons</Typography>;
                            let scoreDisplay = null;
                            let commentDisplay = null;

                            if (isSelf) {
                                const ans = sectionData.answers?.find(a => a.questionId === q.questionId);
                                if (ans) {
                                    // Find rubric description if matches
                                    // Assuming answer stores the 'label' or value. Ideally check implementation.
                                    // Usually answer is the value (0-4) or label. Let's show raw first.

                                    // Try to find description by label first (common pattern)
                                    const desc = q.scoreDescriptions?.find(sd => String(sd.score) === ans.answer || sd.label === ans.answer);

                                    answerDisplay = (
                                        <Box sx={{ bgcolor: theme.palette.success.light + '20', p: 1.5, borderRadius: 1, borderLeft: `4px solid ${theme.palette.success.main}` }}>
                                            <Typography variant="subtitle2" color="success.dark" fontWeight="bold">
                                                {desc ? `${desc.score} - ${desc.label}` : ans.answer}
                                            </Typography>
                                            {desc && <Typography variant="body2" mt={0.5}>{desc.description}</Typography>}
                                        </Box>
                                    );
                                }
                            } else {
                                const mk = sectionData.marks?.find(m => m.questionId === q.questionId);
                                if (mk) {
                                    const desc = q.scoreDescriptions?.find(sd => sd.score === mk.mark);
                                    scoreDisplay = (
                                        <Chip
                                            label={`${mk.mark} / ${q.maxScore}`}
                                            color={mk.mark === 4 ? "success" : mk.mark >= 3 ? "primary" : "warning"}
                                            size="small"
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    );
                                    answerDisplay = (
                                        <Box sx={{ mt: 1 }}>
                                            {desc ? (
                                                <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 1 }}>
                                                    "{desc.description}"
                                                </Typography>
                                            ) : null}
                                        </Box>
                                    );
                                    if (mk.comment) {
                                        commentDisplay = (
                                            <Box sx={{ mt: 1, p: 1, bgcolor: theme.palette.grey[50], borderRadius: 1 }}>
                                                <Typography variant="caption" fontWeight="bold">Ulasan Pentadbir:</Typography>
                                                <Typography variant="body2">{mk.comment}</Typography>
                                            </Box>
                                        );
                                    }
                                }
                            }

                            return (
                                <Box key={q.questionId} sx={{ p: 2, border: '1px solid', borderColor: theme.palette.divider, borderRadius: 2 }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                        <Typography variant="body1" fontWeight="600" sx={{ maxWidth: '85%' }}>
                                            {index + 1}. {q.text}
                                        </Typography>
                                        {scoreDisplay}
                                    </Stack>

                                    {answerDisplay}
                                    {commentDisplay}
                                </Box>
                            );
                        })}
                    </Stack>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} variant="outlined" color="inherit">
                    Tutup
                </Button>
                <Button
                    onClick={handleDownloadPDF}
                    variant="contained"
                    startIcon={downloading ? <Typography variant="caption">Processing...</Typography> : <Download size={18} />}
                    disabled={downloading}
                >
                    {downloading ? "Menjana PDF..." : "Muat Turun PDF"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
