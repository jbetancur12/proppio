import { api } from "../../../api/client";

export const rentersApi = {
    getAll: async () => {
        const res = await api.get('/api/renters');
        return res.data.data; // ApiResponse format
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

    update: async (id: string, data: Partial<{
        firstName: string;
        lastName: string;
        email?: string;
        phone: string;
        identification: string;
    }>) => {
        const res = await api.put(`/api/renters/${id}`, data);
        return res.data.data;
    }
};
