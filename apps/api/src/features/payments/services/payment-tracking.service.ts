import { EntityManager } from '@mikro-orm/core';
import { Lease, LeaseStatus } from '../../leases/entities/Lease';
import { Payment, PaymentStatus, PaymentMethod } from '../entities/Payment';

export interface PendingPaymentMonth {
    month: number;
    year: number;
    monthName: string;
    amount: number;
    dueDate: Date;
}

export class PaymentTrackingService {
    constructor(private readonly em: EntityManager) { }

    /**
     * Generate pending payments for a specific lease if due
     */
    async generatePendingPaymentForLease(lease: Lease): Promise<void> {
        const today = new Date();
        const startDay = new Date(lease.startDate).getDate();

        // Calculate the current period start date based on lease start day
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        // Determine the period start for "this month"
        let periodStart = new Date(currentYear, currentMonth, startDay);

        // Handle month-end issues (e.g. lease starts 31st, but it's Feb)
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        if (startDay > lastDayOfMonth) {
            periodStart = new Date(currentYear, currentMonth, lastDayOfMonth);
        }

        const dueDay = Math.min(startDay, new Date(currentYear, currentMonth + 1, 0).getDate());
        const targetDueDate = new Date(currentYear, currentMonth, dueDay);

        if (today >= targetDueDate) {
            await this.ensurePaymentExists(lease, targetDueDate);
        } else {
            // Check previous month just in case (catch-up)
            const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
            const prevDueDay = Math.min(startDay, new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth() + 1, 0).getDate());
            const prevTargetDueDate = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), prevDueDay);
            await this.ensurePaymentExists(lease, prevTargetDueDate);
        }
    }

    private async ensurePaymentExists(lease: Lease, periodStart: Date): Promise<void> {
        // Calculate period end (start + 1 month)
        const periodEnd = new Date(periodStart);
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        // Check if ANY payment covers this specific period start
        const count = await this.em.count(Payment, {
            lease: lease.id,
            periodStart: periodStart
        });

        if (count === 0) {
            // Create PENDING payment
            const payment = new Payment({
                lease: lease,
                tenantId: lease.tenantId,
                amount: lease.monthlyRent,
                paymentDate: periodStart, // Due date
                periodStart: periodStart,
                periodEnd: periodEnd,
                status: PaymentStatus.PENDING,
                method: PaymentMethod.OTHER, // Default
                notes: `Canon de arrendamiento ${periodStart.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}`
            });

            this.em.persist(payment);
        }
    }

    /**
     * Process all active leases
     */
    async generateAllPendingPayments(): Promise<{ generated: number; errors: string[] }> {
        const leases = await this.em.find(Lease, {
            status: LeaseStatus.ACTIVE
        });

        let generated = 0;
        const errors: string[] = [];

        for (const lease of leases) {
            try {
                await this.generatePendingPaymentForLease(lease);
                generated++;
            } catch (error) {
                errors.push(`Failed to generate payment for lease ${lease.id}: ${error}`);
            }
        }

        await this.em.flush();
        return { generated, errors };
    }

    /**
     * Get pending payments for a lease (from DB)
     */
    async getPendingPayments(leaseId: string): Promise<Payment[]> {
        return this.em.find(Payment, {
            lease: leaseId,
            status: PaymentStatus.PENDING
        }, {
            orderBy: { periodStart: 'ASC' }
        });
    }

    /**
     * Get count of pending payments
     */
    async getPendingPaymentCount(leaseId: string): Promise<number> {
        return this.em.count(Payment, {
            lease: leaseId,
            status: PaymentStatus.PENDING
        });
    }
}
