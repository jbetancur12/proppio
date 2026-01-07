import { api } from "../../../api/client";

export interface PaymentData {
    id: string;
    lease: {
        id: string;
        unit: { id: string; name: string };
        renter: { id: string; firstName: string; lastName: string };
    };
    amount: number;
    paymentDate: string;
    periodStart: string;
    periodEnd: string;
    method: 'CASH' | 'TRANSFER' | 'CHECK' | 'CARD' | 'OTHER';
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    reference?: string;
    notes?: string;
}

export const paymentsApi = {
    getAll: async (leaseId?: string): Promise<PaymentData[]> => {
        const url = leaseId ? `/api/payments?leaseId=${leaseId}` : '/api/payments';
        const res = await api.get(url);
        return res.data.data;
    },

    getById: async (id: string): Promise<PaymentData> => {
        const res = await api.get(`/api/payments/${id}`);
        return res.data.data;
    },

    create: async (data: {
        leaseId: string;
        amount: number;
        paymentDate: string;
        periodStart: string;
        periodEnd: string;
        method?: string;
        reference?: string;
        notes?: string;
    }) => {
        const res = await api.post('/api/payments', data);
        return res.data.data;
    },

    getSummary: async (leaseId: string): Promise<{ total: number; count: number }> => {
        const res = await api.get(`/api/payments/summary/${leaseId}`);
        return res.data.data;
    }
};
