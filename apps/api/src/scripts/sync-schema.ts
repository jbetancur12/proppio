import { MikroORM } from '@mikro-orm/core';
import config from '../mikro-orm.config';

async function syncSchema() {
    const orm = await MikroORM.init(config);

    const generator = orm.getSchemaGenerator();
    await generator.updateSchema();

    console.log('✅ Schema updated successfully!');
    await orm.close();
}

syncSchema().catch(console.error);
