import { useEffect, useState, useCallback } from "react";

export function useQuizHistory({ pollInterval = 8000 } = {}) {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/quiz/history");
      if (!res.ok) throw new Error("Failed to load quiz history");

      const json = await res.json();

      // ⭐ Snapshot JSON.parse here
      const parsed = json.map((item: any) => {
        let snap = {};
        try {
          snap = JSON.parse(typeof item.snapshot === 'string' ? item.snapshot : "{}"); 
        } catch {}

        return {
          ...item,
          snapshot: snap,
        };
      });

      setList(parsed);
    } catch (err: any) {
      setError(err?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [pollInterval]);

  useEffect(() => {
    load();

    const t = setInterval(load, pollInterval);
    return () => clearInterval(t);
  }, [load, pollInterval]);

  return { list, loading, error, reload: load };
}
