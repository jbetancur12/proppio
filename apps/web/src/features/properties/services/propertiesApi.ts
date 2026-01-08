import { api } from "../../../api/client";

export const propertiesApi = {
    getAll: async () => {
        const res = await api.get('/api/properties');
        return res.data;
    },

    getById: async (id: string) => {
        const res = await api.get(`/api/properties/${id}`);
        return res.data;
    },

    create: async (data: { name: string; address: string }) => {
        const res = await api.post('/api/properties', data);
        return res.data;
    },

    getUnits: async (propertyId: string) => {
        const res = await api.get(`/api/properties/${propertyId}/units`);
        return res.data.data;
    },

    createUnit: async (data: { propertyId: string; name: string; type: string; bedrooms?: number; bathrooms?: number; area?: number; baseRent?: number }) => {
        const res = await api.post('/api/properties/units', data);
        return res.data.data;
    },

    update: async (id: string, data: { name: string; address: string }) => {
        const res = await api.put(`/api/properties/${id}`, data);
        return res.data;
    },

    delete: async (id: string) => {
        await api.delete(`/api/properties/${id}`);
    },

    updateUnit: async (id: string, data: { name: string; type: string; bedrooms?: number; bathrooms?: number; area?: number; baseRent?: number, status?: 'VACANT' | 'OCCUPIED' | 'MAINTENANCE' }) => {
        const res = await api.put(`/api/properties/units/${id}`, data);
        return res.data;
    },

    deleteUnit: async (id: string) => {
        await api.delete(`/api/properties/units/${id}`);
    },

    getStats: async (id: string) => {
        const res = await api.get(`/api/properties/${id}/stats`);
        return res.data;
    }
};
