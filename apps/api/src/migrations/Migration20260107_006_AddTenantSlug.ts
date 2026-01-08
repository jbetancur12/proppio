import { Migration } from '@mikro-orm/migrations';

export class Migration20260107_006_AddTenantSlug extends Migration {

    async up(): Promise<void> {
        // Add slug column to tenants table
        await this.execute(`
            ALTER TABLE tenants 
            ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;
        `);

        // Create index for performance
        await this.execute(`
            CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
        `);
    }

    async down(): Promise<void> {
        await this.execute(`
            DROP INDEX IF EXISTS idx_tenants_slug;
            ALTER TABLE tenants DROP COLUMN IF EXISTS slug;
        `);
    }

}
