import { api } from "../../../api/client";

export interface ExpenseData {
    id: string;
    description: string;
    amount: number;
    date: string;
    category: 'MAINTENANCE' | 'REPAIRS' | 'UTILITIES' | 'TAXES' | 'MANAGEMENT' | 'INSURANCE' | 'OTHER';
    status: 'PENDING' | 'PAID' | 'CANCELLED';
    property: { id: string; name: string };
    unit?: { id: string; name: string };
    supplier?: string;
    invoiceNumber?: string;
}

export const expensesApi = {
    getAll: async (propertyId?: string): Promise<ExpenseData[]> => {
        const url = propertyId ? `/api/expenses?propertyId=${propertyId}` : '/api/expenses';
        const res = await api.get(url);
        return res.data.data;
    },

    getById: async (id: string): Promise<ExpenseData> => {
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

    update: async (id: string, data: Partial<ExpenseData>) => {
        const res = await api.put(`/api/expenses/${id}`, data);
        return res.data.data;
    },

    delete: async (id: string) => {
        await api.delete(`/api/expenses/${id}`);
    }
};
