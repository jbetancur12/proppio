import { Migration } from '@mikro-orm/migrations';

export class Migration20260107_EnableRLS extends Migration {

    async up(): Promise<void> {
        // Enable RLS on all tenant tables
        this.addSql(`
      ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
      ALTER TABLE units ENABLE ROW LEVEL SECURITY;
      ALTER TABLE renters ENABLE ROW LEVEL SECURITY;
      ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
      ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
      ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
      ALTER TABLE maintenance_tickets ENABLE ROW LEVEL SECURITY;
    `);

        // Create isolation policies
        const tables = [
            'properties',
            'units',
            'renters',
            'leases',
            'payments',
            'expenses',
            'maintenance_tickets'
        ];

        for (const table of tables) {
            this.addSql(`
        CREATE POLICY tenant_isolation_policy ON ${table}
          FOR ALL
          USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
          WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
      `);

            this.addSql(`
        CREATE POLICY bypass_rls_for_seeds ON ${table}
          USING (current_setting('session_replication_role') = 'replica');
      `);
        }
    }

    async down(): Promise<void> {
        // Drop policies first
        const tables = [
            'properties',
            'units',
            'renters',
            'leases',
            'payments',
            'expenses',
            'maintenance_tickets'
        ];

        for (const table of tables) {
            this.addSql(`DROP POLICY IF EXISTS tenant_isolation_policy ON ${table};`);
            this.addSql(`DROP POLICY IF EXISTS bypass_rls_for_seeds ON ${table};`);
        }

        // Disable RLS
        this.addSql(`
      ALTER TABLE properties DISABLE ROW LEVEL SECURITY;
      ALTER TABLE units DISABLE ROW LEVEL SECURITY;
      ALTER TABLE renters DISABLE ROW LEVEL SECURITY;
      ALTER TABLE leases DISABLE ROW LEVEL SECURITY;
      ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
      ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
      ALTER TABLE maintenance_tickets DISABLE ROW LEVEL SECURITY;
    `);
    }

}
