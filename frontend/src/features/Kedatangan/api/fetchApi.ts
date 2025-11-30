import { backendClient } from "../../../utils/axios-client";

export async function checkIP(): Promise<boolean> {
    const client = backendClient();
    try {
        await client.get("/auth/checkip");
        return true;
    } catch(err: any) {
        if(err.response?.status === 403) return false;
        console.log("API error:", err);
        return false;
    }
}