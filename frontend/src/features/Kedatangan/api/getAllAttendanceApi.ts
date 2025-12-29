import { backendClient } from "../../../utils/axios-client";
import { type AttendanceRecord } from "../type";

export async function getAllAttendance(startDate: string, endDate: string): Promise<AttendanceRecord[]> {
    const client = backendClient();

    try {
        const res = await client.get(`/attendance/all`, {
            params: {
                startDate: startDate,
                endDate: endDate,
            },
        });

        return res.data;
    }
    catch(err: any) {
        console.error("Failed to fetch attendance history", err);
        throw err;
    }
}