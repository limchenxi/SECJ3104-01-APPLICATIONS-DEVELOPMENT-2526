import { backendClient } from "../../../utils/axios-client";

export async function clockIn(userID: string) {
    const client = backendClient();

    try {
        const res = await client.post('attendance/clockin', {
            userID,
            clockInTime: new Date().toISOString(),
        });

        return res.data;
    } catch(err: any) {
        console.log("API error happened");
    }
}