import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import RPHForm from "./Form";
import type { RPHRequest } from "../type";
import { ArrowBack } from "@mui/icons-material";
import { getAuthToken } from "../../../utils/auth";

export default function NewRPH() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function handleGenerate(values: RPHRequest) {
    setLoading(true);

    try {
      const token = getAuthToken();
      const res = await fetch("/api/rph/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Server Error");
      }

      const data = await res.json();
      navigate(`/rph?id=${data._id}`);
    } catch (error) {
      console.error("Generate Error:", error);
      alert(`Gagal menjana RPH: ${error instanceof Error ? error.message : "Unknown Error"}`);
    }

    setLoading(false);
  }

  return (
    <Box sx={{ width: "500px", mx: "auto", mt: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}
      >
        <Typography variant="h4">
          Jana RPH Baharu
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate("/rph")}
        >
          <ArrowBack /> Kembali ke RPH
        </Button>
      </Box>
      <RPHForm isSubmitting={loading} onSubmit={handleGenerate} />
    </Box>
  );
}
