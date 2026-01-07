import { api } from "../../../api/client";

export interface LeaseData {
    id: string;
    unit: {
        id: string;
        name: string;
        property?: {
            id: string;
            name: string;
        }
    };
    renter: {
        id: string;
        firstName: string;
        lastName: string;
        email?: string;
        phone?: string;
    };
    startDate: string;
    endDate: string;
    monthlyRent: number;
    securityDeposit?: number;
    status: 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
    notes?: string;
    contractPdfPath?: string;
}

export const leasesApi = {
    getAll: async (): Promise<LeaseData[]> => {
        const res = await api.get('/api/leases');
        return res.data.data;
    },

    getExpiring: async (days: number = 60): Promise<LeaseData[]> => {
        const res = await api.get(`/api/leases/expiring?days=${days}`);
        return res.data.data;
    },

    getById: async (id: string): Promise<LeaseData> => {
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
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data.data;
    }
};
