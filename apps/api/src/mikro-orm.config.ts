import { defineConfig } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';
import { SeedManager } from '@mikro-orm/seeder';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

export default defineConfig({
    // Adapting paths to your project structure (features + shared)
    entities: [
        './dist/features/**/entities/*.js',
        './dist/shared/entities/*.js'
    ],
    entitiesTs: [
        './src/features/**/entities/*.ts',
        './src/shared/entities/*.ts'
    ],

    dbName: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),

    metadataProvider: process.env.NODE_ENV !== 'production' ? TsMorphMetadataProvider : undefined,
    extensions: [Migrator, SeedManager],

    // Disable strict validation to avoid issues with abstract entities during discovery
    validate: false,

    pool: {
        min: 0,
        max: 40,
    },

    migrations: {
        path: './dist/migrations',
        pathTs: './src/migrations',
        glob: '!(*.d).{js,ts}',
        transactional: true,
        disableForeignKeys: false,
        allOrNothing: true,
        emit: 'ts',
    },

    seeder: {
        path: './dist/seeders',
        pathTs: './src/seeders',
        defaultSeeder: 'DatabaseSeeder',
        glob: '!(*.d).{js,ts}',
        emit: 'ts',
    },

    debug: process.env.NODE_ENV !== 'production',
    allowGlobalContext: true,
});
