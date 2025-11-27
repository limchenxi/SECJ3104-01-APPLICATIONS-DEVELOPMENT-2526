import { useState } from "react";
import { Box, Card, CardContent, Typography, Divider } from "@mui/material";
import type { RPHRequest, RPHResponse } from "../type";
import RPHForm from "./Form";

export default function RPHGenerator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RPHResponse | null>(null);

  async function handleGenerate(values: RPHRequest) {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/rph/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Failed to generate RPH", error);
      alert("Error generating RPH");
    }

    setLoading(false);
  }

  return (
    <Box sx={{ display: "flex", gap: 3 }}>
      {/* FORM */}
      <Box sx={{ width: "400px" }}>
        <Typography variant="h5" gutterBottom>
          Generator RPH
        </Typography>

        <RPHForm
          isSubmitting={loading}
          onSubmit={handleGenerate}
        />
      </Box>

      {/* RESULT */}
      <Box sx={{ flex: 1 }}>
        {result ? (
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6">{result.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {result.date} • {result.duration}
              </Typography>

              <Divider sx={{ my: 2 }} />

              {result.sections.map((sec, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {sec.title}
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                    {sec.content}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        ) : (
          <Typography color="text.secondary">
            Hasil RPH akan dipaparkan di sini...
          </Typography>
        )}
      </Box>
    </Box>
  );
}
