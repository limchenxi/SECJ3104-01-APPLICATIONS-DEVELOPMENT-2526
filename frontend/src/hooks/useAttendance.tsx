import { useState, useCallback } from "react";
import { clockIn as clockInApi } from "../features/Kedatangan/api/attendanceApi";

interface UseAttendanceReturn {
    clockIn: () => Promise<{ timeIn: string } | void>;
    loading: boolean;
    error: string | null;
}

export const useAttendance = (userID: string): UseAttendanceReturn => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    return {clockIn, loading, error};
}