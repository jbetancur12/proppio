import { api } from '@/api/client';

export interface IncreasePreview {
    leaseId: string;
    propertyName: string;
    unitName: string;
    renterName: string;
    currentRent: number;
    suggestedRent: number;
    increasePercentage: number;
    lastIncreaseDate?: string; // Date comes as string from JSON
    eligible: boolean;
    rejectionReason?: string;
}

export interface ApplyIncreaseDto {
    leaseId: string;
    newRent: number;
    increasePercentage: number;
    effectiveDate: string;
    reason?: string;
}

export const rentIncreaseApi = {
    previewIncreases: async (increasePercentage: number, targetDate?: string): Promise<IncreasePreview[]> => {
        const query = `?increasePercentage=${increasePercentage}${targetDate ? `&targetDate=${targetDate}` : ''}`;
        const res = await api.get(`/api/leases/increases/preview${query}`);
        return res.data.data;
    },

    applyIncrease: async (data: ApplyIncreaseDto): Promise<void> => {
        await api.post('/api/leases/increases/apply', data);
    },

    bulkApplyIncreases: async (increases: ApplyIncreaseDto[]): Promise<void> => {
        await api.post('/api/leases/increases/bulk-apply', { increases });
    },

    getIPC: async (year: number): Promise<{ year: number; ipcRate: number | null }> => {
        const response = await api.get(`/api/leases/increases/ipc/${year}`);
        return response.data.data;
    },

    setIPC: async (year: number, ipcRate: number): Promise<void> => {
        await api.post('/api/leases/increases/ipc', { year, ipcRate });
    }
};
