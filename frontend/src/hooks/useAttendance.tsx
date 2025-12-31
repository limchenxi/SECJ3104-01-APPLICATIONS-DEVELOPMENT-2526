import { useState, useCallback } from "react";
import { clockIn as clockInApi } from "../features/Kedatangan/api/clockInApi";
import { clockOut as clockOutApi } from "../features/Kedatangan/api/clockOutApi";
import { getAttendanceRange } from "../features/Kedatangan/api/getAttendanceRangeApi";
import { updateReason as updateReasonApi } from "../features/Kedatangan/api/updateReasonApi";
import type { HistoryByDate } from "../features/Kedatangan/type";

const toISODateString = (date: Date): string =>
    date.toLocaleDateString("en-US", { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/-/g, '-');

interface UseAttendanceReturn {
    clockIn: (reason?: string) => Promise<{ timeIn: string } | void>;
    clockOut: (reason?: string) => Promise<{ timeOut: string } | void>;
    fetchAttendanceForRange: (startDate: string, endDate: string) => Promise<void>;
    updateReason: (recordId: string, type: 'in' | 'out', reason: string) => Promise<void>;
    loading: boolean;
    error: string | null;
    historyByDate: HistoryByDate;
}

export const useAttendance = (userID: string): UseAttendanceReturn => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [historyByDate, setHistoryByDate] = useState<HistoryByDate>({});

    const clockIn = useCallback(async (reason?: string) => {
        if (!userID) {
            setError("User ID is missing");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await clockInApi(userID, reason);
            return res;
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [userID]);

    const clockOut = useCallback(async (reason?: string) => {
        if (!userID) {
            setError("User ID is missing");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await clockOutApi(userID, reason);
            return res;
        }
        catch (err: any) {
            setError(err.response?.data?.message || err.message);
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, [userID]);

    const fetchAttendanceForRange = useCallback(async (startDate: string, endDate: string) => {
        if (!userID) {
            setError("User ID is missing");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const attendanceRecord = await getAttendanceRange(userID, startDate, endDate);
            const newHistoryMap: HistoryByDate = {};

            attendanceRecord.forEach((record: any) => {
                if (record.timeIn) {
                    const timeInDate = new Date(record.timeIn);
                    const dateKey = toISODateString(timeInDate);

                    if (!newHistoryMap[dateKey]) {
                        newHistoryMap[dateKey] = [];
                    }

                    newHistoryMap[dateKey].push({
                        id: (record._id || record.id) + '-in',
                        action: 'in',
                        timestamp: timeInDate,
                        attendanceType: record.attendanceType,
                        reason: record.reasonIn || record.reason,
                        originalRecordId: record._id || record.id,
                    })
                }

                if (record.timeOut) {
                    const timeOutDate = new Date(record.timeOut);
                    const dateKey = toISODateString(timeOutDate);

                    if (!newHistoryMap[dateKey]) {
                        newHistoryMap[dateKey] = [];
                    }
                    newHistoryMap[dateKey].push({
                        id: (record._id || record.id) + '-out',
                        action: 'out',
                        timestamp: timeOutDate,
                        reason: record.reasonOut || record.reason,
                        originalRecordId: record._id || record.id,
                    })
                }
            });

            Object.keys(newHistoryMap).forEach(dateKey => {
                newHistoryMap[dateKey].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            })

            setHistoryByDate(prev => ({ ...prev, ...newHistoryMap }));
        }
        catch (err: any) {
            setError(err.response?.data?.message || err.message);
        }
        finally {
            setLoading(false);
        }
    }, [userID]);

    const updateReason = useCallback(async (recordId: string, type: 'in' | 'out', reason: string) => {
        setLoading(true);
        setError(null);
        try {
            await updateReasonApi(recordId, type, reason);
            // Refresh logic could go here, or let the component handle it
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [])

    return { clockIn, clockOut, fetchAttendanceForRange, updateReason, loading, error, historyByDate };
}