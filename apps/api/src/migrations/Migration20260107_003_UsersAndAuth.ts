import { Migration } from '@mikro-orm/migrations';

export class Migration20260107_003_UsersAndAuth extends Migration {

    async up(): Promise<void> {
        // Create users table
        await this.execute(`
      CREATE TABLE users (
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

        // Create tenant_users junction table
        await this.execute(`
      CREATE TABLE tenant_users (
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
        await this.execute(`
      CREATE INDEX idx_users_email ON users(email);
      CREATE INDEX idx_users_global_role ON users(global_role);
      CREATE INDEX idx_tenant_users_tenant ON tenant_users(tenant_id);
      CREATE INDEX idx_tenant_users_user ON tenant_users(user_id);
    `);
    }

    async down(): Promise<void> {
        await this.execute(`DROP TABLE IF EXISTS tenant_users CASCADE;`);
        await this.execute(`DROP TABLE IF EXISTS users CASCADE;`);
    }

}
