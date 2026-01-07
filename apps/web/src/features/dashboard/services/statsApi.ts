import { api } from "../../../api/client";

export interface DashboardStats {
    totalProperties: number;
    totalUnits: number;
    occupiedUnits: number;
    vacantUnits: number;
    occupancyRate: number;
    totalRenters: number;
    activeLeases: number;
    monthlyExpectedIncome: number;
    monthlyReceivedIncome: number;
    monthlyExpenses: number;
    netIncome: number;
    collectionRate: number;
}

export const statsApi = {
    getDashboard: async (): Promise<DashboardStats> => {
        const res = await api.get('/api/stats/dashboard');
        return res.data.data;
    }
};
