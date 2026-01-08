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
        const response = await api.get(`/api/leases/${leaseId}/pending-payments`);
        return response.data;
    },
    deletePayment: async (paymentId: string): Promise<void> => {
        await api.delete(`/api/payments/${paymentId}`);
    }
};
