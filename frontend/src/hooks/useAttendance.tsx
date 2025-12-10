import { useState, useCallback } from "react";
import { clockIn as clockInApi } from "../features/Kedatangan/api/clockInApi";
import { clockOut as clockOutApi } from "../features/Kedatangan/api/clockOutApi";
import { getAttendanceToday } from "../features/Kedatangan/api/getAttendanceTodayApi";
import type { HistoryEntry } from "../features/Kedatangan/type";

interface UseAttendanceReturn {
    clockIn: () => Promise<{ timeIn: string } | void>;
    clockOut: () => Promise<{ timeOut: string} | void>;
    fetchTodayAttendance: () => Promise<void>;
    loading: boolean;
    error: string | null;
    todayAttendance: HistoryEntry[];
}

export const useAttendance = (userID: string): UseAttendanceReturn => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);

    const clockIn = useCallback(async () => {
        if(!userID) {
            setError("User ID is missing");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await clockInApi(userID);
            return res;
        } catch(err: any) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [userID]);

    const clockOut = useCallback(async () => {
        if(!userID) {
            setError("User ID is missing");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await clockOutApi(userID);
            return res;
        }
        catch(err: any) {
            setError(err.response?.data?.message || err.message);
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, [userID]);

    const fetchTodayAttendance = useCallback(async () => {
        if(!userID) {
            setError("User ID is missing");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await getAttendanceToday(userID);
            if(res) {
                const mapped: HistoryEntry[] = [];
                if(res.timeIn) {
                    mapped.push({ id: 1, action: "in", timestamp: new Date(res.timeIn) });
                }

                if(res.timeOut) {
                    mapped.push({ id: 2, action: "out", timestamp: new Date(res.timeOut) });
                }

                setHistory(mapped.sort((a, b) => b.id - a.id));
            }
        }
        catch(err: any) {
            setError(err.response?.data?.message || err.message);
        }
        finally {
            setLoading(false);
        }
    }, [userID]);

    return {clockIn, clockOut, fetchTodayAttendance, loading, error, todayAttendance: history};
}