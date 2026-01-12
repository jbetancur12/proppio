import { api } from '../../../api/client';
import { Payment } from '@proppio/types';

export const paymentsApi = {
    getAll: async (leaseId?: string): Promise<Payment[]> => {
        const url = leaseId ? `/api/payments?leaseId=${leaseId}` : '/api/payments';
        const res = await api.get(url);
        return res.data.data;
    },

    getById: async (id: string): Promise<Payment> => {
        const res = await api.get(`/api/payments/${id}`);
        return res.data.data;
    },

    create: async (data: {
        leaseId: string;
        amount: number;
        paymentDate: string;
        periodStart: string;
        periodEnd: string;
        method?: 'CASH' | 'TRANSFER' | 'CHECK' | 'CARD' | 'OTHER' | string;
        reference?: string;
        notes?: string;
    }) => {
        const res = await api.post('/api/payments', data);
        return res.data.data;
    },

    update: async (params: { id: string; data: Partial<Payment> }) => {
        const res = await api.put(`/api/payments/${params.id}`, params.data);
        return res.data.data;
    },

    delete: async (id: string) => {
        await api.delete(`/api/payments/${id}`);
    },

    getSummary: async (leaseId: string): Promise<{ total: number; count: number }> => {
        const res = await api.get(`/api/payments/summary/${leaseId}`);
        return res.data.data;
    },

    downloadReceipt: async (id: string, reference?: string) => {
        const res = await api.get(`/api/payments/${id}/receipt`, {
            responseType: 'blob',
        });

        // Create download link
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        const filename = reference ? `recibo-${reference}.pdf` : `recibo-${id.slice(0, 8)}.pdf`;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
    },
};
