import { MikroORM } from '@mikro-orm/core';
import config from '../mikro-orm.config';
import { generatePendingPayments } from '../jobs/generate-pending-payments.job';

async function main() {
    const orm = await MikroORM.init(config);
    const em = orm.em.fork();

    console.log('Starting manual pending payment generation...');
    try {
        const result = await generatePendingPayments(em);
        console.log('Result:', result);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await orm.close();
    }
}

main();
