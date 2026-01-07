import { Migration } from '@mikro-orm/migrations';

export class Migration20260107_002_RentIncreases extends Migration {

    async up(): Promise<void> {
        // Create rent_increases table
        await this.execute(`
      CREATE TABLE rent_increases (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        lease_id UUID NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
        old_rent DECIMAL(15,2) NOT NULL,
        new_rent DECIMAL(15,2) NOT NULL,
        increase_percentage DECIMAL(5,2) NOT NULL,
        effective_date DATE NOT NULL,
        reason VARCHAR(255),
        applied_by VARCHAR(255) NOT NULL,
        tenant_id UUID NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

        // Create index for performance
        await this.execute(`
      CREATE INDEX idx_rent_increases_lease ON rent_increases(lease_id);
      CREATE INDEX idx_rent_increases_tenant ON rent_increases(tenant_id);
    `);

        // Add lastIncreaseDate to leases table
        await this.execute(`
      ALTER TABLE leases ADD COLUMN last_increase_date DATE;
    `);
    }

    async down(): Promise<void> {
        await this.execute(`DROP TABLE IF EXISTS rent_increases CASCADE;`);
        await this.execute(`ALTER TABLE leases DROP COLUMN IF EXISTS last_increase_date;`);
    }

}
