import { api } from '../../../api/client';
import { Lease } from '@proppio/types';

export const leasesApi = {
    getAll: async (): Promise<Lease[]> => {
        const res = await api.get('/api/leases');
        return res.data.data;
    },

    getExpiring: async (days: number = 60): Promise<Lease[]> => {
        const res = await api.get(`/api/leases/expiring?days=${days}`);
        return res.data.data;
    },

    getById: async (id: string): Promise<Lease> => {
        const res = await api.get(`/api/leases/${id}`);
        return res.data.data;
    },

    create: async (data: {
        unitId: string;
        renterId: string;
        startDate: string;
        endDate: string;
        monthlyRent: number;
        securityDeposit?: number;
        notes?: string;
    }) => {
        const res = await api.post('/api/leases', data);
        return res.data.data;
    },

    activate: async (id: string) => {
        const res = await api.post(`/api/leases/${id}/activate`);
        return res.data.data;
    },

    terminate: async (id: string) => {
        const res = await api.post(`/api/leases/${id}/terminate`);
        return res.data.data;
    },

    uploadContract: async (id: string, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.post(`/api/leases/${id}/documents`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data.data;
    },

    getContractUrl: async (id: string): Promise<string> => {
        const res = await api.get(`/api/leases/${id}/contract`);
        return res.data.data.url;
    },

    deleteContract: async (id: string) => {
        const res = await api.delete(`/api/leases/${id}/documents`);
        return res.data.data;
    },
};
