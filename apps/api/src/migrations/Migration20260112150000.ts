import { Migration } from '@mikro-orm/migrations';

export class Migration20260112150000 extends Migration {
    async up(): Promise<void> {
        // Payments indexes for better query performance
        this.addSql('CREATE INDEX IF NOT EXISTS idx_payments_lease_status ON payments(lease_id, status);');
        this.addSql('CREATE INDEX IF NOT EXISTS idx_payments_date_range ON payments(payment_date, period_start);');
        this.addSql('CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);');

        // Leases indexes for dashboard and expiring leases queries
        this.addSql('CREATE INDEX IF NOT EXISTS idx_leases_status_dates ON leases(status, end_date);');
        this.addSql('CREATE INDEX IF NOT EXISTS idx_leases_tenant_status ON leases(tenant_id, status);');
        this.addSql('CREATE INDEX IF NOT EXISTS idx_leases_unit ON leases(unit_id);');

        // Audit Logs indexes for admin panel
        this.addSql('CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_date ON audit_logs(tenant_id, created_at DESC);');
        this.addSql('CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);');
        this.addSql('CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id, created_at DESC);');

        // Expenses indexes for financial reports
        this.addSql('CREATE INDEX IF NOT EXISTS idx_expenses_property_date ON expenses(property_id, date DESC);');
        this.addSql('CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);');

        // Units indexes for property details
        this.addSql('CREATE INDEX IF NOT EXISTS idx_units_property ON units(property_id);');
    }

    async down(): Promise<void> {
        // Drop indexes in reverse order
        this.addSql('DROP INDEX IF EXISTS idx_units_property;');
        this.addSql('DROP INDEX IF EXISTS idx_expenses_status;');
        this.addSql('DROP INDEX IF EXISTS idx_expenses_property_date;');
        this.addSql('DROP INDEX IF EXISTS idx_audit_logs_user;');
        this.addSql('DROP INDEX IF EXISTS idx_audit_logs_action;');
        this.addSql('DROP INDEX IF EXISTS idx_audit_logs_tenant_date;');
        this.addSql('DROP INDEX IF EXISTS idx_leases_unit;');
        this.addSql('DROP INDEX IF EXISTS idx_leases_tenant_status;');
        this.addSql('DROP INDEX IF EXISTS idx_leases_status_dates;');
        this.addSql('DROP INDEX IF EXISTS idx_payments_status;');
        this.addSql('DROP INDEX IF EXISTS idx_payments_date_range;');
        this.addSql('DROP INDEX IF EXISTS idx_payments_lease_status;');
    }
}
