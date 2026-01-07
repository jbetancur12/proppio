import { MikroORM } from '@mikro-orm/core';
import config from './mikro-orm.config';

async function sync() {
    try {
        const orm = await MikroORM.init(config);
        const generator = orm.getSchemaGenerator();

        console.log('🔄 Designing schema...');
        await generator.updateSchema();

        console.log('✅ Schema synchronized successfully');
        await orm.close();
    } catch (error) {
        console.error('❌ Error syncing schema:', error);
        process.exit(1);
    }
}

sync();
