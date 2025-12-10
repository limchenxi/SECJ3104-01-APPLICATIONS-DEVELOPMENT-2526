import { backendClient } from "../../../utils/axios-client";

export async function clockOut(userID: string) {
    const client = backendClient();

    try {
        const res = await client.put('attendance/clockout', {
            userID,
            clockOutTime: new Date().toISOString()
        });

        return res.data;
    }
    catch(err: any) {
        console.log("API error happened");
    }
}