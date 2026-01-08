import { Migration } from '@mikro-orm/migrations';

export class Migration20260107_005_ExitNotices extends Migration {

    async up(): Promise<void> {
        // Create exit_notices table
        await this.execute(`
            CREATE TABLE exit_notices (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                tenant_id UUID NOT NULL,
                lease_id UUID NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
                notice_date DATE NOT NULL,
                planned_exit_date DATE NOT NULL,
                reason TEXT,
                mutual_agreement BOOLEAN DEFAULT false NOT NULL,
                penalty_amount DECIMAL(15,2),
                penalty_waived BOOLEAN DEFAULT false NOT NULL,
                status VARCHAR(20) DEFAULT 'PENDING' NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);

        // Create indexes for performance
        await this.execute(`
            CREATE INDEX idx_exit_notices_tenant ON exit_notices(tenant_id);
            CREATE INDEX idx_exit_notices_lease ON exit_notices(lease_id);
            CREATE INDEX idx_exit_notices_status ON exit_notices(status);
        `);
    }

    async down(): Promise<void> {
        await this.execute(`DROP TABLE IF EXISTS exit_notices CASCADE;`);
    }

}
