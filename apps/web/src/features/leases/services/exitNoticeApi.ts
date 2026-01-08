import { api } from '@/api/client';

export interface ExitNotice {
    id: string;
    leaseId: string;
    noticeDate: string;
    plannedExitDate: string;
    reason?: string;
    mutualAgreement: boolean;
    penaltyAmount?: number;
    penaltyWaived: boolean;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
    createdAt: string;
}

export interface CreateExitNoticeDto {
    plannedExitDate: string;
    reason?: string;
    mutualAgreement?: boolean;
}

export const exitNoticeApi = {
    create: async (leaseId: string, data: CreateExitNoticeDto): Promise<ExitNotice> => {
        const response = await api.post(`/api/leases/${leaseId}/exit-notice`, data);
        return response.data.data;
    },

    getByLease: async (leaseId: string): Promise<ExitNotice[]> => {
        const response = await api.get(`/api/leases/${leaseId}/exit-notices`);
        return response.data.data;
    },

    confirm: async (noticeId: string): Promise<void> => {
        await api.post(`/api/leases/exit-notices/${noticeId}/confirm`);
    },

    cancel: async (noticeId: string): Promise<void> => {
        await api.post(`/api/leases/exit-notices/${noticeId}/cancel`);
    }
};
