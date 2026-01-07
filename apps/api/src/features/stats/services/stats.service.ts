import { EntityManager } from "@mikro-orm/core";
import { PropertyEntity } from "../../properties/entities/Property";
import { UnitEntity, UnitStatus } from "../../properties/entities/Unit";
import { Renter } from "../../renters/entities/Renter";
import { Lease, LeaseStatus } from "../../leases/entities/Lease";
import { Payment, PaymentStatus } from "../../payments/entities/Payment";
import { Expense } from "../../expenses/entities/Expense";

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

/**
 * StatsService - Dashboard KPI calculations
 * Following design_guidelines.md section 2.1 Services Pattern
 */
export class StatsService {
    constructor(private readonly em: EntityManager) { }

    async getDashboardStats(): Promise<DashboardStats> {
        // Counts
        const totalProperties = await this.em.count(PropertyEntity, {});
        const totalUnits = await this.em.count(UnitEntity, {});
        const occupiedUnits = await this.em.count(UnitEntity, { status: UnitStatus.OCCUPIED });
        const vacantUnits = await this.em.count(UnitEntity, { status: UnitStatus.VACANT });
        const totalRenters = await this.em.count(Renter, {});
        const activeLeases = await this.em.count(Lease, { status: LeaseStatus.ACTIVE });

        // Occupancy rate
        const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

        // Monthly expected income (sum of all active lease monthly rents)
        const leases = await this.em.find(Lease, { status: LeaseStatus.ACTIVE });
        const monthlyExpectedIncome = leases.reduce((sum, l) => sum + l.monthlyRent, 0);

        // Monthly received income (sum of payments this month)
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const payments = await this.em.find(Payment, {
            status: PaymentStatus.COMPLETED,
            paymentDate: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
        });
        const monthlyReceivedIncome = payments.reduce((sum, p) => sum + p.amount, 0);

        // Monthly expenses
        const expenses = await this.em.find(Expense, {
            date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
        });
        const monthlyExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

        // Net Income
        const netIncome = monthlyReceivedIncome - monthlyExpenses;

        // Collection rate
        const collectionRate = monthlyExpectedIncome > 0
            ? Math.round((monthlyReceivedIncome / monthlyExpectedIncome) * 100)
            : 0;

        return {
            totalProperties,
            totalUnits,
            occupiedUnits,
            vacantUnits,
            occupancyRate,
            totalRenters,
            activeLeases,
            monthlyExpectedIncome,
            monthlyReceivedIncome,
            monthlyExpenses,
            netIncome,
            collectionRate
        };
    }

    async getFinancialHistory(months: number = 6) {
        // Calculate date range
        const end = new Date();
        const start = new Date();
        start.setMonth(start.getMonth() - months + 1);
        start.setDate(1); // First day of start month
        start.setHours(0, 0, 0, 0);

        // Fetch Payments
        const payments = await this.em.find(Payment, {
            status: PaymentStatus.COMPLETED,
            paymentDate: { $gte: start }
        });

        // Fetch Expenses
        const expenses = await this.em.find(Expense, {
            date: { $gte: start }
        });

        // Group by Month
        const historyMap = new Map<string, { income: number; expense: number }>();

        // Initialize all months to ensure no gaps
        for (let i = 0; i < months; i++) {
            const d = new Date(start);
            d.setMonth(d.getMonth() + i);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            historyMap.set(key, { income: 0, expense: 0 });
        }

        // Aggregate Income
        payments.forEach(p => {
            const d = new Date(p.paymentDate);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (historyMap.has(key)) {
                const entry = historyMap.get(key)!;
                entry.income += p.amount;
            }
        });

        // Aggregate Expenses
        expenses.forEach(e => {
            const d = new Date(e.date);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (historyMap.has(key)) {
                const entry = historyMap.get(key)!;
                entry.expense += e.amount;
            }
        });

        // Convert to Array
        return Array.from(historyMap.entries()).map(([month, data]) => ({
            month, // Format: YYYY-MM
            ...data
        })).sort((a, b) => a.month.localeCompare(b.month));
    }
}
