import { defineConfig } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Tenant } from './features/tenants/entities/Tenant';
import { BaseEntity } from './shared/entities/BaseEntity';
import dotenv from 'dotenv';
import path from 'path';

import { TenantSubscriber } from './shared/subscribers/TenantSubscriber';

import { PropertyEntity } from './features/properties/entities/Property';
import { UnitEntity } from './features/properties/entities/Unit';
import { Renter } from './features/renters/entities/Renter';
import { Lease } from './features/leases/entities/Lease';
import { BaseTenantEntity } from './shared/entities/BaseTenantEntity';


dotenv.config({ path: path.join(__dirname, '../.env') });

export default defineConfig({
    driver: PostgreSqlDriver,
    dbName: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    entities: [Tenant, PropertyEntity, UnitEntity, Renter, Lease],
    subscribers: [new TenantSubscriber()],
    debug: process.env.NODE_ENV !== 'production',
    allowGlobalContext: true, // Allow global context for now, will implement AsyncLocalStorage later
    migrations: {
        path: './dist/migrations',
        pathTs: './src/migrations',
    },
});
