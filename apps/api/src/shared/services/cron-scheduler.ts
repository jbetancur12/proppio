import cron, { ScheduledTask } from 'node-cron';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import { processLeaseRenewals } from '../../jobs/lease-renewal.job';
import { generatePendingPayments } from '../../jobs/generate-pending-payments.job';

export class CronScheduler {
    // Map to store running tasks so we can stop them if needed
    private static scheduledTasks: Map<string, ScheduledTask> = new Map();
    private static orm: MikroORM;

    static async start(orm: MikroORM) {
        console.log('[CRON] Starting cron scheduler...');
        this.orm = orm;

        // 1. Lease Renewal Job - Daily at 00:00
        const leaseRenewalTask = cron.schedule('0 0 * * *', async () => {
            console.log('[CRON] Running lease renewal check...');
            // Create a fork (context) for the background job
            const em = this.orm.em.fork();

            try {
                // Ensure RequestContext if needed by internal calls, though fork is usually enough for simple jobs
                // simpler to just pass EM explicitly to the job function
                await processLeaseRenewals(em);
            } catch (error) {
                console.error('[CRON] Error in lease renewal job:', error);
            }
        }, {
            timezone: 'America/Bogota'
        });

        this.scheduledTasks.set('lease-renewal', leaseRenewalTask);
        console.log('[CRON] ✅ Lease renewal job scheduled (daily at 00:00 America/Bogota)');

        // 2. Persistent Pending Payments Job - Daily at 02:00
        const pendingPaymentsTask = cron.schedule('0 2 * * *', async () => {
            console.log('[CRON] Running pending payments generation...');
            const em = this.orm.em.fork();
            try {
                await generatePendingPayments(em);
            } catch (error) {
                console.error('[CRON] Error in pending payments job:', error);
            }
        }, {
            timezone: 'America/Bogota'
        });

        this.scheduledTasks.set('pending-payments', pendingPaymentsTask);
        console.log('[CRON] ✅ Pending payments job scheduled (daily at 02:00 America/Bogota)');
    }

    static stop() {
        console.log('[CRON] Stopping all cron jobs...');
        this.scheduledTasks.forEach((task, name) => {
            task.stop();
            console.log(`[CRON] Stopped task: ${name}`);
        });
        this.scheduledTasks.clear();
    }
}
