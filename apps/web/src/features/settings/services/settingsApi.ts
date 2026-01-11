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
    }
};
