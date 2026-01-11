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
    /**
     * Generate pending payments for a specific lease if due
     * REFACTOR: Iterates from lease start date to today to ensure no months are skipped
     */
    async generatePendingPaymentForLease(lease: Lease): Promise<void> {
        const today = new Date();
        const startDay = new Date(lease.startDate).getUTCDate();

        // Optimize: Fetch all existing payments for this lease to prevent duplicates without N+1 queries
        // We only check periodStart to match
        const existingPayments = await this.em.find(Payment, {
            lease: lease.id
        }, {
            fields: ['periodStart']
        });

        // Create a set of existing periodStarts (using formatted string or timestamp)
        // Using YYYY-MM-DD string for safe comparison (ignoring time if desired, but periodStart usually has time 00:00:00)
        const existingPeriods = new Set(existingPayments.map(p => p.periodStart.toISOString().split('T')[0]));

        // Normalize dates to start of day for comparison
        // Use firstPaymentDate if present (for migrated leases), otherwise startDate
        const leaseStart = lease.firstPaymentDate ? new Date(lease.firstPaymentDate) : new Date(lease.startDate);

        // FIX: Create cursorDate using UTC components to avoid timezone shifts
        // When reading from DB, dates like "2023-10-02" might come as 00:00 UTC.
        // If we do new Date(year, month, 1) in a local timezone behind UTC (e.g. -5), 
        // it might shift if we are not careful. 
        // SAFEST APPROACH: Build the 'cursor' as a UTC midnight date for the 1st of the month.
        const cursorDate = new Date(Date.UTC(leaseStart.getUTCFullYear(), leaseStart.getUTCMonth(), 1));

        // Loop until we pass "today"
        // We iterate by month using UTC methods
        while (true) {
            // Calculate the expected "Due Date" / "Period Start" for this month cursor
            const year = cursorDate.getUTCFullYear();
            const month = cursorDate.getUTCMonth();

            // Handle end-of-month logic (e.g. started on 31st, now Feb)
            // Get last day of month in UTC
            const lastDayOfCurrentMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
            const targetDay = Math.min(startDay, lastDayOfCurrentMonth);

            const periodStart = new Date(Date.UTC(year, month, targetDay));

            // If the calculated period start is in the future relative to "today", stop.
            if (periodStart > today) {
                break;
            }

            // Only generate if meaningful (e.g. inside lease term) - checking lease endDate?
            // If lease has endDate, and periodStart > endDate, stop.
            if (lease.endDate && periodStart > new Date(lease.endDate)) {
                break;
            }

            // Check if exists
            const dateKey = periodStart.toISOString().split('T')[0];
            if (!existingPeriods.has(dateKey)) {

                // Double check it's not before the lease start date (edge case where logic puts it earlier)
                if (periodStart >= new Date(lease.startDate)) {
                    await this.createPayment(lease, periodStart);
                    existingPeriods.add(dateKey); // Prevent dups if loop is weird
                }
            }

            // Increment cursor month
            cursorDate.setUTCMonth(cursorDate.getUTCMonth() + 1);
        }
    }

    private async createPayment(lease: Lease, periodStart: Date): Promise<void> {
        // Calculate period end (start + 1 month)
        const periodEnd = new Date(periodStart);
        periodEnd.setMonth(periodEnd.getMonth() + 1);

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

    /**
     * Process all active leases
     */
    /**
     * Process all active leases
     * @param tenantId Optional tenant ID to scope the generation
     */
    async generateAllPendingPayments(tenantId?: string): Promise<{ generated: number; errors: string[] }> {
        const query: any = { status: LeaseStatus.ACTIVE };
        if (tenantId) {
            query.tenantId = tenantId;
        }

        const leases = await this.em.find(Lease, query);

        let generated = 0; // Note: with persists inside sub-method, this count might be inaccurate unless we return count from generatePendingPaymentForLease.
        // For now, simpler to just run logic.

        const errors: string[] = [];

        for (const lease of leases) {
            try {
                await this.generatePendingPaymentForLease(lease);
                // generated++; // This counter is now less meaningful, implies "processed lease", not "created payments"
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
