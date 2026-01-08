import { MikroORM } from '@mikro-orm/core';
import config from '../mikro-orm.config';
import { generatePendingPayments } from '../jobs/generate-pending-payments.job';
import { processLeaseRenewals } from '../jobs/lease-renewal.job';

/**
 * Script to manually trigger cron jobs
 * Usage: npx ts-node src/scripts/run-cron.ts <job-name>
 */
async function main() {
    const jobName = process.argv[2];

    const availableJobs = ['all', 'pending-payments', 'lease-renewals'];

    if (!jobName || !availableJobs.includes(jobName)) {
        console.log('\n❌ Usage: npx ts-node src/scripts/run-cron.ts <job-name>');
        console.log('Available jobs:');
        availableJobs.forEach(job => console.log(`  - ${job}`));
        process.exit(1);
    }

    console.log(`\n🔄 Initializing Database Connection...`);
    const orm = await MikroORM.init(config);
    const em = orm.em.fork();

    try {
        console.log(`🚀 Starting execution mode: ${jobName}`);
        const startTime = Date.now();

        if (jobName === 'all' || jobName === 'pending-payments') {
            console.log('\n[1/2] Running Pending Payments...');
            await generatePendingPayments(em);
        }

        if (jobName === 'all' || jobName === 'lease-renewals') {
            console.log('\n[2/2] Running Lease Renewals...');
            await processLeaseRenewals(em);
        }

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`✅ Job completed successfully in ${duration}s`);
    } catch (error) {
        console.error('❌ Job failed:', error);
        process.exit(1);
    } finally {
        await orm.close();
        process.exit(0);
    }
}

main().catch(console.error);
