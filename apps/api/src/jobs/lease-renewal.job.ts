import { EntityManager } from '@mikro-orm/core';
import { LeasesService } from '../features/leases/services/leases.service';
import { logger } from '../shared/logger';

export async function processLeaseRenewals(em: EntityManager) {
    logger.info('Starting automatic lease renewal process');

    try {
        const service = new LeasesService(em);
        const result = await service.processAutomaticRenewals();

        if (result && result.renewed !== undefined) {
            logger.info({ renewed: result.renewed }, `Lease renewal complete: ${result.renewed} leases renewed`);
        }

        if (result && result.errors && result.errors.length > 0) {
            logger.warn({ errors: result.errors }, `Errors during renewal: ${result.errors.length} errors`);
        }

        return result;
    } catch (error) {
        logger.error({ err: error }, 'Fatal error during lease renewal');
        throw error;
    }
}
