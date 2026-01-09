import cron, { ScheduledTask } from 'node-cron';
import { MikroORM } from '@mikro-orm/core';
import { processLeaseRenewals } from '../../jobs/lease-renewal.job';
import { generatePendingPayments } from '../../jobs/generate-pending-payments.job';
import { logger } from '../logger';

export class CronScheduler {
    // Map to store running tasks so we can stop them if needed
    private static scheduledTasks: Map<string, ScheduledTask> = new Map();
    private static orm: MikroORM;

    static async start(orm: MikroORM) {
        logger.info('Starting cron scheduler');
        this.orm = orm;

        // 1. Lease Renewal Job - Daily at 00:00
        const leaseRenewalTask = cron.schedule('0 0 * * *', async () => {
            logger.info('Running lease renewal check');
            const em = this.orm.em.fork();

            try {
                await processLeaseRenewals(em);
                logger.info('Lease renewal check completed successfully');
            } catch (error) {
                logger.error({ err: error }, 'Error in lease renewal job');
            }
        }, {
            timezone: 'America/Bogota'
        });

        this.scheduledTasks.set('lease-renewal', leaseRenewalTask);
        logger.info('Lease renewal job scheduled (daily at 00:00 America/Bogota)');

        // 2. Persistent Pending Payments Job - Daily at 02:00
        const pendingPaymentsTask = cron.schedule('0 2 * * *', async () => {
            logger.info('Running pending payments generation');
            const em = this.orm.em.fork();
            try {
                await generatePendingPayments(em);
                logger.info('Pending payments generation completed successfully');
            } catch (error) {
                logger.error({ err: error }, 'Error in pending payments job');
            }
        }, {
            timezone: 'America/Bogota'
        });

        this.scheduledTasks.set('pending-payments', pendingPaymentsTask);
        logger.info('Pending payments job scheduled (daily at 02:00 America/Bogota)');
    }

    static stop() {
        logger.info('Stopping all cron jobs');
        this.scheduledTasks.forEach((task, name) => {
            task.stop();
            logger.info({ taskName: name }, 'Stopped cron task');
        });
        this.scheduledTasks.clear();
    }

    static async initialize() {
        // This is called from app.ts after ORM is ready
        // For now this is just here for any future init logic
        logger.info('Cron scheduler initialized');
    }
}
