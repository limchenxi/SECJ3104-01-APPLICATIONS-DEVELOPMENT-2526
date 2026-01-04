import { useEffect, useState, useCallback } from "react";
import { backendClient } from "../../../utils/axios-client";

export function useQuizHistory({ pollInterval = 0 } = {}) {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // const res = await fetch("/api/quiz/history");
      const client = backendClient();
      const res = await client.get("/quiz/history");
      const json = res.data;

      // Snapshot JSON.parse here
      const parsed = json.map((item: any) => {
        let snap = {};
        try {
          // If snapshot is a string, parse it. If it's already an object, use it.
          if (typeof item.snapshot === 'string') {
            snap = JSON.parse(item.snapshot);
          } else if (item.snapshot) {
            snap = item.snapshot;
          }
        } catch { }

        return {
          ...item,
          snapshot: snap,
        };
      });

      setList(parsed);
    } catch (err: any) {
      // setError(err?.message || "Failed to load");
      setError(err?.response?.data?.message || err?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    let t: number | undefined;
    if (pollInterval > 0) {
      t = setInterval(load, pollInterval);
    }

    return () => {
      if (t !== undefined) {
        clearInterval(t);
      }
    };
  }, [load, pollInterval]);
  return { list, loading, error, reload: load };
}
