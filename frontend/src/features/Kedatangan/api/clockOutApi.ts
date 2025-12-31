import { backendClient } from "../../../utils/axios-client";

export async function clockOut(userID: string, reason?: string) {
    const client = backendClient();

    try {
        const res = await client.put('attendance/clockout', {
            userID,
            clockOutTime: new Date().toISOString(),
            reason
        });

        return res.data;
    }
    catch (err: any) {
        console.log("API error happened");
    }
}