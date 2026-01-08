import { EntityManager } from '@mikro-orm/core';
import { Lease, LeaseStatus } from '../entities/Lease';
import { AuditLogService } from '../../admin/services/audit-log.service';

export class LeaseRenewalService {
    constructor(private readonly em: EntityManager) { }

    /**
     * Find active leases that are past their end date and eligible for automatic renewal
     */
    async findExpiredLeasesForRenewal(): Promise<Lease[]> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return this.em.find(Lease, {
            status: LeaseStatus.ACTIVE,
            endDate: { $lt: today }
        });
    }

    /**
     * Renew a lease by extending endDate by 1 year and incrementing renewal count
     */
    async renewLease(leaseId: string): Promise<void> {
        const lease = await this.em.findOne(Lease, { id: leaseId });

        if (!lease) {
            throw new Error('Lease not found');
        }

        // Set originalEndDate if this is the first renewal
        if (!lease.originalEndDate) {
            lease.originalEndDate = new Date(lease.endDate);
        }

        // Extend endDate by 1 year
        const newEndDate = new Date(lease.endDate);
        newEndDate.setFullYear(newEndDate.getFullYear() + 1);

        const oldEndDate = lease.endDate;
        lease.endDate = newEndDate;
        lease.renewalCount += 1;

        await this.em.flush();

        // Log renewal to audit (system-initiated)
        const auditService = new AuditLogService(this.em);
        await auditService.log({
            action: 'LEASE_RENEWED',
            resourceType: 'Lease',
            resourceId: leaseId,
            oldValues: { endDate: oldEndDate, renewalCount: lease.renewalCount - 1 },
            newValues: { endDate: newEndDate, renewalCount: lease.renewalCount },
            performedBy: 'SYSTEM'
        });
    }

    /**
     * Process all eligible leases for automatic renewal (called by cron job)
     */
    async processAutomaticRenewals(): Promise<{ renewed: number; errors: string[] }> {
        const expiredLeases = await this.findExpiredLeasesForRenewal();
        const errors: string[] = [];
        let renewed = 0;

        for (const lease of expiredLeases) {
            try {
                await this.renewLease(lease.id);
                renewed++;
            } catch (error) {
                errors.push(`Failed to renew lease ${lease.id}: ${error}`);
            }
        }

        return { renewed, errors };
    }

    /**
     * Check if a lease is in its first year (for penalty calculation)
     */
    isInFirstYear(lease: Lease): boolean {
        const startDate = new Date(lease.startDate);
        const oneYearLater = new Date(startDate);
        oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

        const today = new Date();
        return today < oneYearLater;
    }
}
