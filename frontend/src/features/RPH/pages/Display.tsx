import {
  Card,
  CardContent,
  Typography,
  Divider,
  Box,
  Button,
  TextField,
  Grid,
} from "@mui/material";
import type { RPH } from "../type";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useEffect, useState } from "react";

const SCHOOL_LOGO_URL = "/SKSRISIAKAP.png";

interface Props {
  data: RPH | null;
  onSave?: (updated: RPH) => void;
}

export default function Display({ data, onSave }: Props) {
  const [editable, setEditable] = useState<RPH | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load selected record
  useEffect(() => {
    setEditable(data);
    setIsEditing(false); // reset editing mode when switching item
  }, [data]);

  if (!editable) {
    return (
      <Typography color="text.secondary">
        Sila pilih atau jana RPH untuk dipaparkan...
      </Typography>
    );
  }
  function updateField(field: keyof RPH, value: any) {
    setEditable((prev) => (prev ? { ...prev, [field]: value } : null));
  }

  function updateSection(index: number, value: string) {
    if (!editable) return;
    const newSections = [...editable.sections];
    newSections[index].content = value;
    setEditable({ ...editable, sections: newSections });
  }
  // function updateSection(index: number, value: string) {
  //   const updated = { ...editable };
  //   updated.sections[index].content = value;
  //   setEditable(updated);
  // }

  async function exportPDF() {
    const element = document.getElementById("rph-display");
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`RPH_${editable.subject}_${editable.topic}.pdf`);

    // const pdf = new jsPDF("p", "mm", "a4");
    // const pageWidth = pdf.internal.pageSize.getWidth();
    // const pageHeight = pdf.internal.pageSize.getHeight();

    // const canvas = await html2canvas(element, { scale: 2 });
    // const imgData = canvas.toDataURL("image/png");

    // const imgWidth = pageWidth;
    // const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // let heightLeft = imgHeight;
    // let position = 0;

    // pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    // heightLeft -= pageHeight;

    // while (heightLeft > 0) {
    //   pdf.addPage();
    //   position = heightLeft - imgHeight;
    //   pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    //   heightLeft -= pageHeight;
    // }

    // pdf.save(`${editable.title}.pdf`);
  }

  return (
    <>
      {/* Action Buttons */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mb: 2 }}>
        {!isEditing ? (
          <Button variant="outlined" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        ) : (
          <>
            <Button
              variant="contained"
              onClick={() => {
                if (onSave && editable) onSave(editable);
                setIsEditing(false);
              }}
            >
              Simpan
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setIsEditing(false)}
            >
              Batal
            </Button>
          </>
        )}

        <Button variant="contained" onClick={exportPDF}>
          Export PDF
        </Button>
      </Box>

      {/* RPH Content */}
      <Card id="rph-display" variant="outlined" sx={{ borderRadius: 3, p: 2 }}>
        <CardContent>
          <Box sx={{ textAlign: "center", mb: 2 }}>
            {/* Logo */}{" "}
            <img
              src={SCHOOL_LOGO_URL}
              alt="Logo Sekolah"
              style={{
                maxWidth: "80px",
                height: "auto",
                display: "block",
                margin: "0 auto",
                marginBottom: "8px",
              }}
            />
            <Typography variant="h6" fontWeight="bold">SEKOLAH KEBANGSAAN SRI SIAKAP</Typography>
            <Typography variant="body2">PPD KERIAN, PERAK</Typography>
          </Box>
          <Divider sx={{ borderBottomWidth: 2, mb: 2, borderColor: 'black' }} />

          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid size={4}>
              <Typography variant="body2"><strong>Minggu:</strong> {editable.minggu || '-'}</Typography>
            </Grid>
            <Grid size={4}>
              <Typography variant="body2"><strong>Tarikh:</strong> {editable.date}</Typography>
            </Grid>
            <Grid size={4}>
              <Typography variant="body2"><strong>Masa:</strong> {editable.duration}</Typography>
            </Grid>
            <Grid size={4}>
              <Typography variant="body2"><strong>Subjek:</strong> {editable.subject}</Typography>
            </Grid>
            <Grid size={4}>
              <Typography variant="body2"><strong>Kelas:</strong> Tahun {editable.level}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 1 }} />

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="primary" fontWeight="bold">TAJUK: {editable.topic}</Typography>
            
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2"><strong>Standard Kandungan:</strong></Typography>
              <Typography variant="body2" sx={{ ml: 1 }}>{editable.standardKandungan}</Typography>
            </Box>

            <Box sx={{ mt: 1 }}>
              <Typography variant="body2"><strong>Standard Pembelajaran:</strong></Typography>
              <Typography variant="body2" sx={{ ml: 1 }}>{editable.standardPembelajaran}</Typography>
            </Box>

            <Box sx={{ mt: 1 }}>
              <Typography variant="body2"><strong>Objektif Pembelajaran:</strong></Typography>
              <Typography variant="body2" sx={{ ml: 1, whiteSpace: 'pre-wrap' }}>{editable.objectives}</Typography>
            </Box>

            {editable.kriteriaKejayaan && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2"><strong>Kriteria Kejayaan:</strong></Typography>
                <Typography variant="body2" sx={{ ml: 1 }}>{editable.kriteriaKejayaan}</Typography>
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 1 }} />
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={4}>
              <Typography variant="caption" fontWeight="bold">EMK</Typography>
              <Typography variant="body2">{editable.emk || '-'}</Typography>
            </Grid>
            <Grid size={4}>
              <Typography variant="caption" fontWeight="bold">BBM</Typography>
              <Typography variant="body2">{editable.bbm || '-'}</Typography>
            </Grid>
            <Grid size={4}>
              <Typography variant="caption" fontWeight="bold">PENTAKSIRAN (PBD)</Typography>
              <Typography variant="body2">{editable.pbd || '-'}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 2 }} />

          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, textDecoration: 'underline' }}>
            AKTIVITI PENGAJARAN & PEMBELAJARAN
          </Typography>
          
          {editable.sections?.map((sec, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight="bold">{sec.title}</Typography>
              {isEditing ? (
                <TextField
                  fullWidth multiline minRows={2}
                  value={sec.content}
                  onChange={(e) => updateSection(index, e.target.value)}
                  sx={{ mt: 0.5 }}
                />
              ) : (
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", ml: 1 }}>
                  {sec.content}
                </Typography>
              )}
            </Box>
          ))}

          <Divider sx={{ my: 2 }} />

          <Typography variant="body2" fontWeight="bold">REFLEKSI:</Typography>
          {isEditing ? (
            <TextField
              fullWidth multiline minRows={2}
              value={editable.refleksi || ""}
              onChange={(e) => updateField('refleksi', e.target.value)}
              placeholder="Masukkan refleksi selepas pengajaran..."
              sx={{ mt: 1 }}
            />
          ) : (
            <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
              {editable.refleksi || "Belum direkodkan."}
            </Typography>
          )}
        </CardContent>
      </Card>
    </>
  );
}
