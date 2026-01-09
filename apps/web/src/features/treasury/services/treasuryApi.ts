import { api } from '../../../api/client';

export interface TreasuryTransaction {
    id: string;
    date: string; // ISO Date
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    category: string;
    description?: string;
    reference?: string;
}

export interface UnifiedTransaction {
    id: string;
    date: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    category: string;
    description: string;
    source: 'LEASE_PAYMENT' | 'PROPERTY_EXPENSE' | 'TREASURY';
    reference?: string;
}

export interface GlobalBalance {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
}

export const treasuryApi = {
    getBalance: async () => {
        const response = await api.get<{ success: boolean; data: GlobalBalance }>(
            '/api/treasury/balance'
        );
        return response.data.data;
    },

    getTransactions: async (params?: { startDate?: string; endDate?: string; page?: number; limit?: number }) => {
        const response = await api.get<{ success: boolean; data: UnifiedTransaction[]; meta: { total: number; page: number; limit: number } }>(
            '/api/treasury/transactions',
            { params }
        );
        return response.data;
    },

    createTransaction: async (data: Partial<TreasuryTransaction>) => {
        const response = await api.post<{ success: boolean; data: TreasuryTransaction }>(
            '/api/treasury/transactions',
            data
        );
        return response.data.data;
    }
};
