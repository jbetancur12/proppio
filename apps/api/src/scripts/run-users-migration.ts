import { MikroORM } from '@mikro-orm/core';
import config from '../mikro-orm.config';

async function runUsersMigration() {
    const orm = await MikroORM.init(config);
    const em = orm.em.fork();
    const connection = em.getConnection();

    try {
        console.log('🔧 Creando tablas users y tenant_users...');

        // Create users table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                first_name VARCHAR(255),
                last_name VARCHAR(255),
                global_role VARCHAR(50) NOT NULL DEFAULT 'USER',
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);

        // Create tenant_users table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS tenant_users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                role VARCHAR(50) NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
                UNIQUE(tenant_id, user_id)
            );
        `);

        // Create indexes
        await connection.execute(`
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        `);
        await connection.execute(`
            CREATE INDEX IF NOT EXISTS idx_users_global_role ON users(global_role);
        `);
        await connection.execute(`
            CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant ON tenant_users(tenant_id);
        `);
        await connection.execute(`
            CREATE INDEX IF NOT EXISTS idx_tenant_users_user ON tenant_users(user_id);
        `);

        // Mark migration as executed
        await connection.execute(`
            INSERT INTO mikro_orm_migrations (name, executed_at)
            VALUES ('Migration20260107_003_UsersAndAuth', NOW())
            ON CONFLICT DO NOTHING;
        `);

        console.log('✅ Tablas creadas exitosamente');
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await orm.close();
    }
}

runUsersMigration();
