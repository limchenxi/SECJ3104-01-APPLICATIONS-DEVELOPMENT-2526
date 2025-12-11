import {
  Button,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useState, useEffect } from "react";

import type { AIModule} from "../../type";
import AIModuleForm from "./Form";
import AIModuleCard from  "./card";
import { createAIModule, deleteAIModule, listAIModules, updateAIModule } from "../../api/ai-module.api";

export default function AIList() {
  const [modules, setModules] = useState<AIModule[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<AIModule | null>(null);

  const [deleteId, setDeleteId] = useState("");
  // const [testModule, setTestModule] = useState<AIModule | null>(null);
  // const [testPrompt, setTestPrompt] = useState("");
  // const [testResult, setTestResult] = useState("");

  useEffect(() => {
    loadModules();
  }, []);

  async function loadModules() {
    // const res = await fetch("/api/ai/modules");
    // setModules(await res.json());
    const res = await listAIModules();
    setModules(res);
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
    try {
      if (data._id) {
        await updateAIModule(data._id, data);
      } else {
        const { _id, ...newData } = data; 
        await createAIModule(newData as AIModule);
        // await createAIModule(data);
      }
      setOpenForm(false);
      loadModules();
    } catch (e) {
        alert("fail to save");
    }
   }

  // async function deleteModule() {
  //   await fetch(`/api/ai/modules/${deleteId}`, { method: "DELETE" });
  //   setDeleteId("");
  //   loadModules();
  // }

  async function handleDeleteModule() {
    await deleteAIModule(deleteId);
    setDeleteId("");
    loadModules();
  }

  async function toggleModuleEnabled(id: string, enabled: boolean) {
    await updateAIModule(id, { enabled });
    loadModules(); // 重新加载数据以更新列表
  }

  // async function runTest() {
  //   if (!testModule) return;

  //   const res = await fetch("/api/ai/run", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({
  //       module: testModule.usageType,
  //       prompt: testPrompt,
  //     }),
  //   });

  //   const data = await res.json();
  //   setTestResult(JSON.stringify(data, null, 2));
  // }

  return (
    <Stack spacing={3}>
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>Senarai Model AI</Typography>
        <Button variant="contained" onClick={openAdd}>
          Add Module
        </Button>
      </Stack>

      {/* MODULE LIST */}
      {modules.map((m) => (
        <AIModuleCard
          key={m._id}
          module={m}
          onEdit={openEdit}
          onDelete={setDeleteId}
          onToggleEnabled={toggleModuleEnabled}
        />
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
          <Button color="error" onClick={handleDeleteModule}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* TEST MODULE */}
      {/* <Dialog open={!!testModule} onClose={() => setTestModule(null)} maxWidth="sm" fullWidth>
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
      </Dialog> */}
    </Stack>
  );
}
