import { MikroORM } from '@mikro-orm/core';
import config from '../mikro-orm.config';

async function runAuditLogsMigration() {
    const orm = await MikroORM.init(config);
    const em = orm.em.fork();
    const connection = em.getConnection();

    try {
        console.log('🔧 Creando tabla audit_logs...');

        // Create table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS audit_logs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                action VARCHAR(255) NOT NULL,
                resource_type VARCHAR(100),
                resource_id UUID,
                old_values JSONB,
                new_values JSONB,
                ip_address VARCHAR(50),
                user_agent TEXT,
                created_at TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);

        // Create indexes
        await connection.execute(`
            CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON audit_logs(tenant_id);
        `);
        await connection.execute(`
            CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
        `);
        await connection.execute(`
            CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
        `);

        // Mark migration as executed (fake name to track it)
        await connection.execute(`
            INSERT INTO mikro_orm_migrations (name, executed_at)
            VALUES ('Migration20260107_004_AuditLogs', NOW())
            ON CONFLICT DO NOTHING;
        `);

        console.log('✅ Tabla audit_logs creada exitosamente');
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await orm.close();
    }
}

runAuditLogsMigration();
