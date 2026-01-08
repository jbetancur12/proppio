import { EntityManager } from '@mikro-orm/core';
import { Lease } from '../../leases/entities/Lease';
import { Payment, PaymentStatus } from '../entities/Payment';

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
     * Calculate all expected payment months from lease start to current date
     */
    private calculateExpectedPayments(lease: Lease): PendingPaymentMonth[] {
        const startDate = new Date(lease.startDate);
        const today = new Date();
        const expectedPayments: PendingPaymentMonth[] = [];

        // Start from the first month of the lease
        const currentMonth = new Date(startDate);
        currentMonth.setDate(1); // Set to first day of month

        while (currentMonth <= today) {
            const month = currentMonth.getMonth();
            const year = currentMonth.getFullYear();

            // Calculate due date properly handling month lengths
            // If start date is 31st, and current month only has 30 days (or 28/29), use last day of month
            const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
            const dueDay = Math.min(startDate.getDate(), lastDayOfMonth);
            const dueDate = new Date(year, month, dueDay);

            // strict check: if due date is in the future, don't count it yet
            // This handles cases where we are in the same month but before the start day
            if (dueDate > today) {
                break;
            }

            expectedPayments.push({
                month,
                year,
                monthName: currentMonth.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }),
                amount: lease.monthlyRent,
                dueDate
            });

            // Move to next month
            currentMonth.setMonth(currentMonth.getMonth() + 1);
            currentMonth.setDate(1); // Ensure we stay on 1st to avoid skipping shorter months issues
        }

        return expectedPayments;
    }

    /**
     * Get pending payments for a lease
     */
    async getPendingPayments(leaseId: string): Promise<PendingPaymentMonth[]> {
        const lease = await this.em.findOne(Lease, { id: leaseId });

        if (!lease) {
            throw new Error('Lease not found');
        }

        // Get all completed payments for this lease
        const completedPayments = await this.em.find(Payment, {
            lease: leaseId,
            status: PaymentStatus.COMPLETED
        });

        // Calculate expected payments
        const expectedPayments = this.calculateExpectedPayments(lease);

        // Filter out months that have completed payments
        const pendingPayments = expectedPayments.filter(expected => {
            return !completedPayments.some(payment => {
                const paymentDate = new Date(payment.paymentDate);
                return paymentDate.getMonth() === expected.month &&
                    paymentDate.getFullYear() === expected.year;
            });
        });

        return pendingPayments;
    }

    /**
     * Get count of pending payments
     */
    async getPendingPaymentCount(leaseId: string): Promise<number> {
        const pending = await this.getPendingPayments(leaseId);
        return pending.length;
    }
}
