import { backendClient } from "../../../utils/axios-client";

export async function updateReason(recordId: string, type: 'in' | 'out', reason: string) {
    const client = backendClient();

    try {
        const res = await client.put('attendance/reason', {
            recordId,
            type,
            reason
        });

        return res.data;
    } catch (err: any) {
        throw err;
    }
}
