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

// New interface to accommodate the change in the create function's data parameter
export interface CreateExitNoticeData extends CreateExitNoticeDto {
    leaseId: string;
}

export const exitNoticeApi = {
    create: async (data: CreateExitNoticeData): Promise<ExitNotice> => {
        const response = await api.post(`/api/leases/${data.leaseId}/exit-notice`, data);
        return response.data.data;
    },

    getByLease: async (leaseId: string): Promise<ExitNotice[]> => {
        const response = await api.get(`/api/leases/${leaseId}/exit-notices`);
        return response.data.data;
    },

    confirm: async (noticeId: string): Promise<ExitNotice> => {
        const response = await api.post(`/api/leases/exit-notices/${noticeId}/confirm`);
        return response.data.data;
    },

    cancel: async (noticeId: string): Promise<ExitNotice> => {
        const response = await api.post(`/api/leases/exit-notices/${noticeId}/cancel`);
        return response.data.data;
    }
};
