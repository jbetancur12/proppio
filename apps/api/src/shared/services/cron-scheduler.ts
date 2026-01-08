import cron, { ScheduledTask } from 'node-cron';
import { MikroORM } from '@mikro-orm/core';
import { processLeaseRenewals } from '../../jobs/lease-renewal.job';

export class CronScheduler {
    private static tasks: ScheduledTask[] = [];

    static async start(orm: MikroORM) {
        console.log('[CRON] Starting cron scheduler...');

        // Lease renewal job - runs daily at midnight
        const leaseRenewalTask = cron.schedule('0 0 * * *', async () => {
            console.log('[CRON] Running daily lease renewal job...');
            const em = orm.em.fork();
            try {
                await processLeaseRenewals(em);
            } catch (error) {
                console.error('[CRON] Error in lease renewal job:', error);
            }
        }, {
            timezone: 'America/Bogota'
        });

        this.tasks.push(leaseRenewalTask);
        console.log('[CRON] ✅ Lease renewal job scheduled (daily at 00:00 America/Bogota)');
    }

    static stop() {
        console.log('[CRON] Stopping all cron jobs...');
        this.tasks.forEach(task => task.stop());
        this.tasks = [];
    }
}
