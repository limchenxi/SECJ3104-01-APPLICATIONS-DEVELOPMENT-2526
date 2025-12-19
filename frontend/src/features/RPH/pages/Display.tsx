import {
  Card,
  CardContent,
  Typography,
  Divider,
  Box,
  Button,
  TextField,
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
        Tiada data untuk dipaparkan...
      </Typography>
    );
  }

  function updateSection(index: number, value: string) {
    const updated = { ...editable };
    updated.sections[index].content = value;
    setEditable(updated);
  }

  async function exportPDF() {
    const element = document.getElementById("rph-display");
    if (!element) return;

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      pdf.addPage();
      position = heightLeft - imgHeight;
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${editable.title}.pdf`);
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
              Save
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setIsEditing(false)}
            >
              Cancel
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
          <Box sx={{ textAlign: "center", mb: 3 }}>
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
            {/* School Name */}{" "}
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
              SK SRI SIAKAP {" "}
            </Typography>
            {/* RPH Title */}{" "}
            <Typography variant="h6" color="text.primary">
               {editable.title}{" "}
            </Typography>
           {" "}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
            {editable.date} • {editable.duration}
          </Typography>

          <Divider sx={{ my: 2 }} />

          {editable.sections?.map((sec, index) => (
            <Box key={index} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {sec.title}
              </Typography>

              {isEditing ? (
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  value={sec.content}
                  onChange={(e) => updateSection(index, e.target.value)}
                  sx={{ mt: 1 }}
                />
              ) : (
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {sec.content}
                </Typography>
              )}
            </Box>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
