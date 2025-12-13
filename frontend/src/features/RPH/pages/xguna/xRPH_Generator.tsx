import { useState, useRef } from "react";
import { Box, Typography } from "@mui/material";
import type { RPHRequest, RPHResponse, RPH } from "../../type";
import RPHForm from "../Form";
import History from "../History";
import Display from "../Display";

export default function RPHGenerator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RPHResponse | null>(null);

  const historyRef = useRef<{ refresh: () => void } | null>(null);

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

      // new record created → refresh history
      historyRef.current?.refresh();
    } catch (error) {
      console.error("Failed to generate RPH", error);
      alert("Error generating RPH");
    }

    setLoading(false);
  }

  // ---- When user edits inside Display and clicks SAVE ----
  async function handleSave(updated: RPH) {
    const res = await fetch(`/api/rph/${updated._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });

    const saved = await res.json();
    setResult(saved);

    // refresh history because title/date may change
    historyRef.current?.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Padam RPH ini?")) return;

    await fetch(`/api/rph/${id}`, { method: "DELETE" });

    setResult(null);
    historyRef.current?.refresh();
  }

  return (
    <Box sx={{ display: "flex", gap: 3 }}>
      {/* History */}
      <History
        ref={historyRef}
        onSelect={(item) => setResult(item)}
        onDelete={handleDelete}
      />

      {/* FORM */}
      <Box sx={{ width: "400px" }}>
        <Typography variant="h5" gutterBottom>
          Generator RPH
        </Typography>

        <RPHForm isSubmitting={loading} onSubmit={handleGenerate} />
      </Box>

      {/* Display (View + Edit + PDF Export) */}
      <Box sx={{ flex: 1 }}>
        <Display data={result} onSave={handleSave} />
      </Box>
    </Box>
  );
}
