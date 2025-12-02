import { useEffect, useRef, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { RPH } from "../type";
import Display from "./Display";
import History from "./History";

export default function RPH() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();      
  const historyRef = useRef<{ refresh: () => void } | null>(null);

  const [selected, setSelected] = useState<RPH | null>(null);

  useEffect(() => {
    const id = searchParams.get("id");         

    if (id) loadSingle(id);
    else setSelected(null);

  }, [searchParams]);                         

  async function loadSingle(id: string) {
    const res = await fetch(`/api/rph/${id}`);
    const data = await res.json();
    setSelected(data);
  }

  async function handleSave(updated: RPH) {
    const res = await fetch(`/api/rph/${updated._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });

    const saved = await res.json();
    setSelected(saved);
    historyRef.current?.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Padam RPH ini?")) return;
    await fetch(`/api/rph/${id}`, { method: "DELETE" });
    setSelected(null);
    navigate("/rph");
    historyRef.current?.refresh();
  }

  return (
    <Box sx={{ p: 3, maxWidth: "xl", mx: "auto" }}>
      <Box>
        <Typography variant="h4" sx={{ mb: 0.5 }}>
          🧠 eRPH - Penjana Rancangan Pengajaran
        </Typography>
        <Typography color="text.secondary">
          Jana Rancangan Pengajaran Harian (RPH) dengan bantuan kecerdasan buatan
        </Typography>
        <br /><br />
      </Box>
      
      <Box sx={{ display: "flex", gap: 3 }}>

        {/* left：History */}
        <History
          ref={historyRef}
          onSelect={(item) => {
            navigate(`/rph?id=${item._id}`);
          }}
          onDelete={handleDelete}
        />

        {/* right：Display */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h5">Editor RPH</Typography>

            <Button
              variant="contained"
              onClick={() => navigate("/rph/new")}
            >
              + RPH Baharu
            </Button>
          </Box>

          <Display data={selected} onSave={handleSave} />
        </Box>
      </Box>
    </Box>
  );
}
