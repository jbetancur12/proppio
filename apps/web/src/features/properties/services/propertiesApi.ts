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
        return res.data;
    },

    createUnit: async (data: { propertyId: string; name: string; type: string }) => {
        const res = await api.post('/api/properties/units', data);
        return res.data;
    }
};
