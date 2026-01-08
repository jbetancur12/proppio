import { EntityManager } from '@mikro-orm/core';
import { PaymentTrackingService } from '../features/payments/services/payment-tracking.service';

export async function generatePendingPayments(em: EntityManager): Promise<{ generated: number; errors: string[] }> {
    console.log('[CRON] Starting pending payment generation...');

    const service = new PaymentTrackingService(em);

    try {
        const result = await service.generateAllPendingPayments();

        console.log(`[CRON] Payment generation complete: ${result.generated} payments processed`);

        if (result.errors.length > 0) {
            console.error(`[CRON] Errors during payment generation:`, result.errors);
        }
        return result;
    } catch (error) {
        console.error('[CRON] Fatal error during payment generation:', error);
        throw error;
    }
}
