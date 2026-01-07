import { api } from "../../../api/client";

export enum TicketStatus {
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGRESS',
    RESOLVED = 'RESOLVED',
    CLOSED = 'CLOSED'
}

export enum TicketPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT'
}

export interface MaintenanceTicket {
    id: string;
    title: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    unit: { id: string; name: string; property?: { name: string } };
    reportedBy?: { id: string; firstName: string; lastName: string };
    createdAt: string;
    resolvedAt?: string;
    images?: string[];
}

export const maintenanceApi = {
    getAll: async (params?: { status?: string; unitId?: string }): Promise<MaintenanceTicket[]> => {
        const query = new URLSearchParams(params as any).toString();
        const res = await api.get(`/api/maintenance?${query}`);
        return res.data.data;
    },

    create: async (data: {
        title: string;
        description: string;
        unitId: string;
        priority: string;
        reportedById?: string;
    }) => {
        const res = await api.post('/api/maintenance', data);
        return res.data.data;
    },

    updateStatus: async (id: string, status: TicketStatus) => {
        const res = await api.put(`/api/maintenance/${id}`, { status });
        return res.data.data;
    }
};
