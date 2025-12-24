import { useState, useCallback } from "react";
import { clockIn as clockInApi } from "../features/Kedatangan/api/clockInApi";
import { clockOut as clockOutApi } from "../features/Kedatangan/api/clockOutApi";
import { getAttendanceToday } from "../features/Kedatangan/api/getAttendanceTodayApi";
import { getAttendanceRange } from "../features/Kedatangan/api/getAttendanceRangeApi";
import type { HistoryByDate, HistoryEntry } from "../features/Kedatangan/type";

const toISODateString = (date: Date): string => 
  date.toLocaleDateString("en-US", { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/-/g, '-');

interface UseAttendanceReturn {
    clockIn: () => Promise<{ timeIn: string } | void>;
    clockOut: () => Promise<{ timeOut: string} | void>;
    fetchAttendanceForRange: (startDate: string, endDate: string) => Promise<void>;
    loading: boolean;
    error: string | null;
    historyByDate: HistoryByDate;
}

export const useAttendance = (userID: string): UseAttendanceReturn => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [historyByDate, setHistoryByDate] = useState<HistoryByDate>({});

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

    const fetchAttendanceForRange = useCallback(async (startDate: string, endDate: string) => {
        if(!userID) {
            setError("User ID is missing");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const attendanceRecord = await getAttendanceRange(userID, startDate, endDate);
            const newHistoryMap: HistoryByDate = {};

            attendanceRecord.forEach(record => {
                if (record.timeIn) {
                    const timeInDate = new Date(record.timeIn);
                    const dateKey = toISODateString(timeInDate);

                    if(!newHistoryMap[dateKey]) {
                        newHistoryMap[dateKey] = [];
                    }
                    newHistoryMap[dateKey].push({
                        id: record.id + '-in',
                        action: 'in',
                        timestamp: timeInDate,
                    })
                }

                if (record.timeIn) {
                    const timeOutDate = new Date(record.timeOut);
                    const dateKey = toISODateString(timeOutDate);

                    if(!newHistoryMap[dateKey]) {
                        newHistoryMap[dateKey] = [];
                    }
                    newHistoryMap[dateKey].push({
                        id: record.id + '-out',
                        action: 'out',
                        timestamp: timeOutDate,
                    })
                }
            });

            Object.keys(newHistoryMap).forEach(dateKey => {
                newHistoryMap[dateKey].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            })

            setHistoryByDate(prev => ({ ...prev, ...newHistoryMap }));
        }
        catch(err: any) {
            setError(err.response?.data?.message || err.message);
        }
        finally {
            setLoading(false);
        }
    }, [userID]);

    return {clockIn, clockOut, fetchAttendanceForRange, loading, error, historyByDate};
}