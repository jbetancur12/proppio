import { Request, Response, NextFunction } from 'express';
import { EntityManager } from '@mikro-orm/core';
import { generatePendingPayments } from '../../../jobs/generate-pending-payments.job';
import { processLeaseRenewals } from '../../../jobs/lease-renewal.job';
import { AppError } from '../../../shared/errors/AppError';

export class SystemController {
    /**
     * Manually trigger a cron job for the authenticated tenant
     * POST /api/system/cron/run
     * Body: { jobName: 'all' | 'pending-payments' | 'lease-renewals' }
     */
    async runCronJob(req: Request, res: Response, next: NextFunction) {
        try {
            const { jobName } = req.body;
            const em: EntityManager = (req as any).em;
            const tenantId = (req as any).user?.tenantId;

            if (!tenantId) {
                throw new AppError('Tenant context required', 400);
            }

            const availableJobs = ['all', 'pending-payments', 'lease-renewals'];
            if (!availableJobs.includes(jobName)) {
                throw new AppError('Invalid job name', 400);
            }

            const results: any = {};

            if (jobName === 'all' || jobName === 'pending-payments') {
                results.pendingPayments = await generatePendingPayments(em, tenantId);
            }

            if (jobName === 'all' || jobName === 'lease-renewals') {
                results.leaseRenewals = await processLeaseRenewals(em, tenantId);
            }

            res.json({
                message: 'Jobs executed successfully',
                scope: 'tenant',
                tenantId,
                results
            });
        } catch (error) {
            next(error);
        }
    }
}
