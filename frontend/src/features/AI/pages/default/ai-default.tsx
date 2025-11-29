import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { useSnackbar } from "notistack";

// 接收 moduleId，例如从路由 params 来
export default function AiModuleSettings({ moduleId }: { moduleId: string }) {
  const [settings, setSettings] = useState({
    provider: "",
    model: "",
    temperature: 0.7,
    maxToken: 2000,
    timeout: 20,
    name: "",
    usageType: "",
  });

  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const [saving, setSaving] = useState(false);

  // Load module settings
  useEffect(() => {
    if (!moduleId) return;

    fetch(`/api/ai/modules/${moduleId}`)
      .then(async (res) => {
        const data = await res.json();
        setSettings(data);
      })
      .catch(() => console.error("Failed to load AI module"))
      .finally(() => setLoading(false));
  }, [moduleId]);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/ai/modules/${moduleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        enqueueSnackbar("AI Module updated", { variant: "success" });
      } else {
        const text = await res.text();
        enqueueSnackbar("Failed to save: " + (text || res.statusText), {
          variant: "error",
        });
      }
    } catch (err) {
      enqueueSnackbar("Failed to save settings", { variant: "error" });
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Edit AI Module: {settings.name}</h2>

      Provider:
      <select
        value={settings.provider}
        onChange={(e) => setSettings({ ...settings, provider: e.target.value })}
      >
        <option value="OpenAI">OpenAI</option>
        <option value="Gemini">Gemini</option>
        <option value="Copilot">Copilot</option>
      </select>

      <br />

      Model:
      <input
        value={settings.model}
        onChange={(e) => setSettings({ ...settings, model: e.target.value })}
      />

      <br />

      Temperature:
      <input
        type="number"
        step="0.1"
        value={settings.temperature}
        onChange={(e) =>
          setSettings({ ...settings, temperature: Number(e.target.value) })
        }
      />

      <br />

      Max tokens:
      <input
        type="number"
        value={settings.maxToken}
        onChange={(e) =>
          setSettings({ ...settings, maxToken: Number(e.target.value) })
        }
      />

      <br />

      Timeout (ms):
      <input
        type="number"
        value={settings.timeout}
        onChange={(e) =>
          setSettings({ ...settings, timeout: Number(e.target.value) })
        }
      />

      <br />

      <Button variant="contained" onClick={save} disabled={saving}>
        {saving ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}
