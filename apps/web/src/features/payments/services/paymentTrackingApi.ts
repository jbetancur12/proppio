import { api } from "../../../api/client";

export interface PendingPaymentMonth {
    month: number;
    year: number;
    monthName: string;
    amount: number;
    dueDate: string;
}

export const paymentTrackingApi = {
    getPendingPayments: async (leaseId: string): Promise<PendingPaymentMonth[]> => {
        const response = await api.get(`/leases/${leaseId}/pending-payments`);
        return response.data.data;
    }
};
