import { api } from '../../../api/client';
import { PaginatedResponse } from '@/types/pagination';
import { Expense } from '@proppio/types';

export const expensesApi = {
    getAll: async (params?: {
        page?: number;
        limit?: number;
        search?: string;
        propertyId?: string;
    }): Promise<PaginatedResponse<Expense>> => {
        const res = await api.get('/api/expenses', { params });
        return res.data;
    },

    getById: async (id: string): Promise<Expense> => {
        const res = await api.get(`/api/expenses/${id}`);
        return res.data.data;
    },

    create: async (data: {
        propertyId: string;
        unitId?: string;
        description: string;
        amount: number;
        date: string;
        category: string;
        status: string;
        supplier?: string;
        invoiceNumber?: string;
    }) => {
        const res = await api.post('/api/expenses', data);
        return res.data.data;
    },

    update: async (id: string, data: Partial<Expense>) => {
        const res = await api.put(`/api/expenses/${id}`, data);
        return res.data.data;
    },

    delete: async (id: string) => {
        await api.delete(`/api/expenses/${id}`);
    },
};
