import { EntityManager } from '@mikro-orm/core';
import { LeaseRenewalService } from '../features/leases/services/lease-renewal.service';

/**
 * Cron job to process automatic lease renewals daily
 * Schedule: Every day at 00:00 (midnight)
 */
export async function processLeaseRenewals(em: EntityManager): Promise<void> {
    console.log('[CRON] Starting automatic lease renewal process...');

    const service = new LeaseRenewalService(em);

    try {
        const result = await service.processAutomaticRenewals();

        console.log(`[CRON] Lease renewal complete: ${result.renewed} leases renewed`);

        if (result.errors.length > 0) {
            console.error(`[CRON] Errors during renewal:`, result.errors);
        }
    } catch (error) {
        console.error('[CRON] Fatal error during lease renewal:', error);
        throw error;
    }
}
