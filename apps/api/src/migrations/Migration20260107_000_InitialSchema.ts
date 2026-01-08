import { Migration } from '@mikro-orm/migrations';

export class Migration20260107_InitialSchema extends Migration {

  async up(): Promise<void> {
    // Create tenants table (System table - no tenant_id)
    this.addSql(`
      CREATE TABLE IF NOT EXISTS tenants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE,
        status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
        plan VARCHAR(50) NOT NULL DEFAULT 'FREE',
        config JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
    `);

    // Create properties table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS properties (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_properties_tenant ON properties(tenant_id);
    `);

    // Create units table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS units (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100),
        area DECIMAL(10,2),
        bedrooms INTEGER,
        bathrooms DECIMAL(3,1),
        status VARCHAR(50) NOT NULL DEFAULT 'VACANT',
        base_rent DECIMAL(15,2),
        property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        tenant_id UUID NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_units_property ON units(property_id);
      CREATE INDEX IF NOT EXISTS idx_units_tenant ON units(tenant_id);
    `);

    // Create renters table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS renters (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        identification_number VARCHAR(100),
        tenant_id UUID NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_renters_tenant ON renters(tenant_id);
    `);

    // Create leases table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS leases (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        monthly_rent DECIMAL(15,2) NOT NULL,
        security_deposit DECIMAL(15,2),
        status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
        unit_id UUID NOT NULL REFERENCES units(id),
        renter_id UUID NOT NULL REFERENCES renters(id),
        tenant_id UUID NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_leases_unit ON leases(unit_id);
      CREATE INDEX IF NOT EXISTS idx_leases_renter ON leases(renter_id);
      CREATE INDEX IF NOT EXISTS idx_leases_tenant ON leases(tenant_id);
    `);

    // Create payments table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        amount DECIMAL(15,2) NOT NULL,
        payment_date DATE NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
        notes TEXT,
        lease_id UUID NOT NULL REFERENCES leases(id),
        tenant_id UUID NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_payments_lease ON payments(lease_id);
      CREATE INDEX IF NOT EXISTS idx_payments_tenant ON payments(tenant_id);
    `);

    // Create expenses table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS expenses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        description TEXT NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        date DATE NOT NULL,
        category VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
        property_id UUID NOT NULL REFERENCES properties(id),
        unit_id UUID REFERENCES units(id),
        tenant_id UUID NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_expenses_property ON expenses(property_id);
      CREATE INDEX IF NOT EXISTS idx_expenses_tenant ON expenses(tenant_id);
    `);

    // Create maintenance_tickets table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS maintenance_tickets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
        status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
        unit_id UUID NOT NULL REFERENCES units(id),
        renter_id UUID REFERENCES renters(id),
        tenant_id UUID NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_maintenance_unit ON maintenance_tickets(unit_id);
      CREATE INDEX IF NOT EXISTS idx_maintenance_tenant ON maintenance_tickets(tenant_id);
    `);
  }

  async down(): Promise<void> {
    // Drop tables in reverse order (respecting foreign keys)
    this.addSql(`DROP TABLE IF EXISTS maintenance_tickets CASCADE;`);
    this.addSql(`DROP TABLE IF EXISTS expenses CASCADE;`);
    this.addSql(`DROP TABLE IF EXISTS payments CASCADE;`);
    this.addSql(`DROP TABLE IF EXISTS leases CASCADE;`);
    this.addSql(`DROP TABLE IF EXISTS renters CASCADE;`);
    this.addSql(`DROP TABLE IF EXISTS units CASCADE;`);
    this.addSql(`DROP TABLE IF EXISTS properties CASCADE;`);
    this.addSql(`DROP TABLE IF EXISTS tenants CASCADE;`);
  }

}
