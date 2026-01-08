import { api } from '@/api/client';

export interface Tenant {
    id: string;
    name: string;
    slug: string;
    status: 'ACTIVE' | 'SUSPENDED';
    plan?: string;
    createdAt: string;
}

export interface TenantStats {
    propertiesCount: number;
    leasesCount: number;
    usersCount: number;
}

export interface GlobalMetrics {
    totalTenants: number;
    activeTenants: number;
    suspendedTenants: number;
    totalUsers: number;
}

export interface CreateTenantDto {
    name: string;
    slug: string;
    plan?: string;
    adminUser: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
    };
}

export interface AuditLog {
    id: string;
    action: string;
    resourceType?: string;
    resourceId?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
    createdAt: string;
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
    tenant?: {
        id: string;
        name: string;
    };
}

export interface AuditLogFilters {
    tenantId?: string;
    userId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
}

export const adminApi = {
    // Tenants
    getAllTenants: async (): Promise<Tenant[]> => {
        const response = await api.get('/api/admin/tenants');
        return response.data.data;
    },

    getTenant: async (id: string): Promise<{ tenant: Tenant; stats: TenantStats }> => {
        const response = await api.get(`/api/admin/tenants/${id}`);
        return response.data.data;
    },

    createTenant: async (data: CreateTenantDto): Promise<Tenant> => {
        const response = await api.post('/api/admin/tenants', data);
        return response.data.data;
    },

    updateTenantStatus: async (id: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<void> => {
        await api.patch(`/api/admin/tenants/${id}/status`, { status });
    },

    updateTenantConfig: async (id: string, config: any): Promise<void> => {
        await api.patch(`/api/admin/tenants/${id}/config`, { config });
    },

    // Metrics
    getGlobalMetrics: async (): Promise<GlobalMetrics> => {
        const response = await api.get('/api/admin/metrics/global');
        return response.data.data;
    },

    // Audit Logs
    getAuditLogs: async (filters: AuditLogFilters): Promise<{ logs: AuditLog[]; count: number }> => {
        const response = await api.get('/api/admin/audit-logs', { params: filters });
        return response.data.data;
    },

    getFinancialMetrics: async () => {
        const response = await api.get('/api/admin/metrics/financial');
        return response.data.data;
    }
};
