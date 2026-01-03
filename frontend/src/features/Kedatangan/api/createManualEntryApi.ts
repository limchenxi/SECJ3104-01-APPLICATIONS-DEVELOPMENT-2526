import { backendClient } from "../../../utils/axios-client";
// import { type AttendanceRecord } from "../type";

export async function createManualEntry(dto: {
    userID: string,
    date: string,
    clockInTime: string,
    clockOutTime: string
}) {
    const client = backendClient();

    try {
        const res = await client.post(`/attendance/manual`, dto);
        return res.data;
    }
    catch(err: any) {
        console.log("Failed to create entry");
    }
}