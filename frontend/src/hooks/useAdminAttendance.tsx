import { useState, useCallback } from "react";
import { getAllAttendance } from "../features/Kedatangan/api/getAllAttendanceApi";
import { createManualEntry } from "../features/Kedatangan/api/createManualEntryApi";

export const useAdminAttendance = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [globalHistory, setGlobalHistory] = useState<any[]>([]);

    const fetchDashboardFeed = useCallback(async (start: string, end: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllAttendance(start, end);
      setGlobalHistory(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  const submitManualRecord = useCallback(async (payload: any) => {
    setLoading(true);
    try {
      await createManualEntry(payload);
      return true; // Success
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save manual record");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    globalHistory,
    fetchDashboardFeed,
    submitManualRecord,
    loading,
    error
  };
}