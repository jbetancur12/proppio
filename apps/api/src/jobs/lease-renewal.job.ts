import { EntityManager } from '@mikro-orm/core';
import { LeaseRenewalService } from '../features/leases/services/lease-renewal.service';
import { logger } from '../shared/logger';

export async function processLeaseRenewals(em: EntityManager): Promise<{ renewed: number; errors: string[] }> {
    logger.info('Starting automatic lease renewal process');

    const service = new LeaseRenewalService(em);

    try {
        const result = await service.processAutomaticRenewals();

        logger.info({ renewed: result.renewed }, `Lease renewal complete: ${result.renewed} leases renewed`);

        if (result.errors.length > 0) {
            logger.warn({ errors: result.errors }, `Errors during renewal: ${result.errors.length} errors`);
        }

        return result;
    } catch (error) {
        logger.error({ err: error }, 'Fatal error during lease renewal');
        throw error;
    }
}
