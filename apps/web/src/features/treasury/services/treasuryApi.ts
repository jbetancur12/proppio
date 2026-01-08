import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
        const response = await axios.get<{ success: boolean; data: GlobalBalance }>(
            `${API_URL}/treasury/balance`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
        return response.data.data;
    },

    getTransactions: async (params?: { startDate?: string; endDate?: string; page?: number; limit?: number }) => {
        const response = await axios.get<{ success: boolean; data: UnifiedTransaction[]; meta: { total: number; page: number; limit: number } }>(
            `${API_URL}/treasury/transactions`,
            {
                params,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
        return response.data;
    },

    createTransaction: async (data: Partial<TreasuryTransaction>) => {
        const response = await axios.post<{ success: boolean; data: TreasuryTransaction }>(
            `${API_URL}/treasury/transactions`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
        return response.data.data;
    }
};
