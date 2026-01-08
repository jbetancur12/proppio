import { EntityManager } from '@mikro-orm/core';
import { Tenant, TenantStatus } from '../../tenants/entities/Tenant';
import { Payment, PaymentStatus } from '../../payments/entities/Payment';

export class MetricsService {
    constructor(private readonly em: EntityManager) { }

    private readonly PLAN_PRICES: Record<string, number> = {
        'FREE': 0,
        'BASIC': 50000,
        'PRO': 150000,
        'ENTERPRISE': 500000
    };

    /**
     * Calculates Monthly Recurring Revenue (MRR) based on active tenant plans
     */
    async calculateMRR(): Promise<number> {
        const tenants = await this.em.find(Tenant, { status: TenantStatus.ACTIVE });

        return tenants.reduce((total, tenant) => {
            const price = this.PLAN_PRICES[tenant.plan || 'FREE'] || 0;
            return total + price;
        }, 0);
    }

    /**
     * Calculates Annual Recurring Revenue (ARR)
     */
    async calculateARR(): Promise<number> {
        const mrr = await this.calculateMRR();
        return mrr * 12;
    }

    /**
     * Breakdown of revenue by tenant (projected monthly)
     */
    async getRevenueByTenant(): Promise<{ tenantId: string; tenantName: string; amount: number }[]> {
        const tenants = await this.em.find(Tenant, { status: TenantStatus.ACTIVE });

        return tenants.map(tenant => ({
            tenantId: tenant.id,
            tenantName: tenant.name,
            amount: this.PLAN_PRICES[tenant.plan || 'FREE'] || 0
        })).sort((a, b) => b.amount - a.amount);
    }

    /**
     * Calculates global payment success rate from the payments table
     */
    async getPaymentSuccessRate(): Promise<number> {
        const em = this.em.fork();
        const totalPayments = await em.count(Payment, {}, { filters: false }); // Disable tenant filter
        const successfulPayments = await em.count(Payment, { status: PaymentStatus.COMPLETED }, { filters: false });

        if (totalPayments === 0) return 100;

        return Math.round((successfulPayments / totalPayments) * 100);
    }

    async getFinancialMetrics() {
        const [mrr, arr, revenueByTenant, successRate] = await Promise.all([
            this.calculateMRR(),
            this.calculateARR(),
            this.getRevenueByTenant(),
            this.getPaymentSuccessRate()
        ]);

        return {
            mrr,
            arr,
            revenueByTenant,
            successRate
        };
    }
}
