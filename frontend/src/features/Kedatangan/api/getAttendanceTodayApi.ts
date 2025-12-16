import { backendClient } from "../../../utils/axios-client";

export async function getAttendanceToday(userId: string) {
    const client = backendClient();

    try {
        const res = await client.get(`/attendance/${userId}/today`);
        return res.data;
    } catch(err: any) {
        console.log("Failed to fetch attendance for user");
    }
}   