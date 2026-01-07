import { api } from '@/api/client';

export interface IncreasePreview {
    leaseId: string;
    propertyName: string;
    unitName: string;
    renterName: string;
    currentRent: number;
    suggestedRent: number;
    increasePercentage: number;
    lastIncreaseDate?: string;
}

export interface ApplyIncreaseDto {
    leaseId: string;
    newRent: number;
    increasePercentage: number;
    effectiveDate: string;
    reason?: string;
}

export const rentIncreaseApi = {
    previewIncreases: async (increasePercentage: number): Promise<IncreasePreview[]> => {
        const response = await api.get(`/api/leases/increases/preview?increasePercentage=${increasePercentage}`);
        return response.data.data;
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
