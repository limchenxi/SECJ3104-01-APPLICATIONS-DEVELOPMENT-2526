import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import RPHForm from "./Form";
import type { RPHRequest } from "../type";

export default function NewRPH() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function handleGenerate(values: RPHRequest) {
    setLoading(true);

    try {
      const res = await fetch("/api/rph/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      navigate(`/rph?id=${data._id}`);
    } catch (error) {
      alert("Gagal menjana RPH");
    }

    setLoading(false);
  }

  return (
    <Box sx={{ width: "500px", mx: "auto", mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Jana RPH Baharu
      </Typography>

      <RPHForm isSubmitting={loading} onSubmit={handleGenerate} />
    </Box>
  );
}
