import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { useState, useEffect } from "react";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

import type { AIModule, AIGeneratedItem } from "../../type";
import AIModuleForm from "./Form";

interface AIListProps {
  items?: AIGeneratedItem[];
}

export default function AIList({ items }: AIListProps) {
  const [modules, setModules] = useState<AIModule[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<AIModule | null>(null);

  const [deleteId, setDeleteId] = useState("");
  const [testModule, setTestModule] = useState<AIModule | null>(null);
  const [testPrompt, setTestPrompt] = useState("");
  const [testResult, setTestResult] = useState("");

  useEffect(() => {
    loadModules();
  }, []);

  async function loadModules() {
    const res = await fetch("/api/ai/modules");
    setModules(await res.json());
  }

  function openAdd() {
    setEditing(null);
    setOpenForm(true);
  }

  function openEdit(module: AIModule) {
    setEditing(module);
    setOpenForm(true);
  }

  async function saveModule(data: AIModule) {
    const method = data._id ? "PUT" : "POST";
    const url = data._id
      ? `/api/ai/modules/${data._id}`
      : "/api/ai/modules";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setOpenForm(false);
    loadModules();
  }

  async function deleteModule() {
    await fetch(`/api/ai/modules/${deleteId}`, { method: "DELETE" });
    setDeleteId("");
    loadModules();
  }

  async function runTest() {
    if (!testModule) return;

    const res = await fetch("/api/ai/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        module: testModule.usageType,
        prompt: testPrompt,
      }),
    });

    const data = await res.json();
    setTestResult(JSON.stringify(data, null, 2));
  }

  return (
    <Stack spacing={3}>
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h5">AI Modules</Typography>
        <Button variant="contained" onClick={openAdd}>
          Add Module
        </Button>
      </Stack>

      {/* MODULE LIST */}
      {modules.map((m) => (
        <Card key={m._id} variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h6">{m.name}</Typography>

                <Stack direction="row">
                  <IconButton size="small" onClick={() => openEdit(m)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setDeleteId(m._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </Stack>

              <Typography variant="body2" color="text.secondary">
                Provider: {m.provider} | Model: {m.model}
              </Typography>

              <Button
                variant="outlined"
                size="small"
                startIcon={<PlayArrowIcon />}
                onClick={() => setTestModule(m)}
              >
                Test Module
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ))}

      {/* MODULE FORM */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          <AIModuleForm initialValues={editing || undefined} onSubmit={saveModule} />
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRM */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId("")}>
        <DialogTitle>Delete Module?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteId("")}>Cancel</Button>
          <Button color="error" onClick={deleteModule}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* TEST MODULE */}
      <Dialog open={!!testModule} onClose={() => setTestModule(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Test: {testModule?.name}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Prompt"
            multiline
            minRows={3}
            value={testPrompt}
            onChange={(e) => setTestPrompt(e.target.value)}
          />
          {testResult && (
            <Box mt={2}>
              <Typography variant="subtitle2">Result:</Typography>
              <pre style={{ whiteSpace: "pre-wrap" }}>{testResult}</pre>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={runTest} variant="contained">Run Test</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
