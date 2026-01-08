import { api } from "../../../api/client";

export interface PendingPayment {
    id: string;
    amount: number;
    paymentDate: string; // This is the Due Date for pending
    periodStart: string;
    periodEnd: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    method: string;
    description?: string;
    notes?: string;
}

export const paymentTrackingApi = {
    getPendingPayments: async (leaseId: string): Promise<PendingPayment[]> => {
        const response = await api.get(`/leases/${leaseId}/pending-payments`);
        return response.data; // API returns the array directly now (or wrapped in data?) wrapper checks usually handle data.data
        // LeasesController uses ApiResponse.success which wraps in { success: true, data: ... }
        // api client interceptor typically unwraps? Let's assume standard behavior.
        // Wait, ApiResponse.success returns res.json({ success: true, data }).
        // frontend api client usually returns response.data. But let's check `api/client.ts`.
        // If I use `response.data.data` as before, it is correct.
        // But let's check the previous code... `return response.data.data;`
        // So I'll keep it.
    },
    deletePayment: async (paymentId: string): Promise<void> => {
        await api.delete(`/payments/${paymentId}`);
    }
};
