import { Migration } from '@mikro-orm/migrations';

export class Migration20260107_004_LeaseRenewalFields extends Migration {

    async up(): Promise<void> {
        // Add renewal-related fields to leases table
        await this.execute(`
            ALTER TABLE leases 
            ADD COLUMN original_end_date DATE,
            ADD COLUMN renewal_count INTEGER DEFAULT 0 NOT NULL,
            ADD COLUMN notice_required_days INTEGER DEFAULT 90 NOT NULL,
            ADD COLUMN early_termination_penalty DECIMAL(15,2);
        `);

        // Set original_end_date to current end_date for existing leases
        await this.execute(`
            UPDATE leases 
            SET original_end_date = end_date 
            WHERE original_end_date IS NULL;
        `);
    }

    async down(): Promise<void> {
        await this.execute(`
            ALTER TABLE leases 
            DROP COLUMN IF EXISTS original_end_date,
            DROP COLUMN IF EXISTS renewal_count,
            DROP COLUMN IF EXISTS notice_required_days,
            DROP COLUMN IF EXISTS early_termination_penalty;
        `);
    }

}
