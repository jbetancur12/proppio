import { EntityManager } from '@mikro-orm/core';
import { PaymentTrackingService } from '../features/payments/services/payment-tracking.service';
import { logger } from '../shared/logger';

export async function generatePendingPayments(em: EntityManager) {
    logger.info('Starting pending payment generation');

    try {
        const service = new PaymentTrackingService(em);
        const result = await service.generatePendingPaymentsForAllLeases();

        if (result && result.generated !== undefined) {
            logger.info({ generated: result.generated }, `Payment generation complete: ${result.generated} payments processed`);
        }

        if (result && result.errors && result.errors.length > 0) {
            logger.warn({ errors: result.errors }, `Errors during payment generation: ${result.errors.length} errors`);
        }

        return result;
    } catch (error) {
        logger.error({ err: error }, 'Fatal error during payment generation');
        throw error;
    }
}
