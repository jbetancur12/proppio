import { EntityManager } from '@mikro-orm/core';
import { PaymentTrackingService } from '../features/payments/services/payment-tracking.service';
import { logger } from '../shared/logger';

export async function generatePendingPayments(em: EntityManager): Promise<{ generated: number; errors: string[] }> {
    logger.info('Starting pending payment generation');

    const service = new PaymentTrackingService(em);

    try {
        const result = await service.generateAllPendingPayments();

        logger.info({ generated: result.generated }, `Payment generation complete: ${result.generated} payments processed`);

        if (result.errors.length > 0) {
            logger.warn({ errors: result.errors }, `Errors during payment generation: ${result.errors.length} errors`);
        }
        return result;
    } catch (error) {
        logger.error({ err: error }, 'Fatal error during payment generation');
        throw error;
    }
}
