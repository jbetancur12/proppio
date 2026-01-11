import { api } from "@/api/client";

export interface CronExecutionResult {
    message: string;
    scope: string;
    tenantId: string;
    results: any;
}

export const settingsApi = {
    runCronJob: async (jobName: 'all' | 'pending-payments' | 'lease-renewals'): Promise<CronExecutionResult> => {
        const response = await api.post('/api/system/cron/run', { jobName });
        return response.data;
    },

    updateTenantConfig: async (config: { timezone?: string }) => {
        // We assume there is an endpoint PATCH /api/tenants/me or similar, 
        // OR we use the existing tenants update endpoint if we know the ID.
        // For current user context, usually /api/me/tenant or similar is best.
        // However, looking at routes, we have /api/tenants/:id.
        // We need to know the tenantId. 
        // Let's assume the caller will pass it or we get it from store.
        // TO KEEP IT SIMPLE: use /api/tenants/current/config if it existed, but it doesn't.
        // Let's rely on the frontend passing the ID or use a new endpoint in SystemController?
        // Actually, let's look at tenants routes.
        const response = await api.patch('/api/tenants/me/config', config);
        return response.data;
    }
};
