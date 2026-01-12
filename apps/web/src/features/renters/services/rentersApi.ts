import { api } from '../../../api/client';
import { PaginatedResponse } from '@/types/pagination';
import { Renter } from '@proppio/types';

export const rentersApi = {
    getAll: async (params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<Renter>> => {
        const res = await api.get('/api/renters', { params });
        return res.data; // Returns { data: [], meta: {...}, success: true }
    },

    create: async (data: {
        firstName: string;
        lastName: string;
        email?: string;
        phone: string;
        identification: string;
    }) => {
        const res = await api.post('/api/renters', data);
        return res.data.data;
    },

    update: async (
        id: string,
        data: Partial<{
            firstName: string;
            lastName: string;
            email?: string;
            phone: string;
            identification: string;
        }>,
    ) => {
        const res = await api.put(`/api/renters/${id}`, data);
        return res.data.data;
    },

    getHistory: async (id: string) => {
        const res = await api.get(`/api/renters/${id}/history`);
        return res.data.data;
    },
};
