import { Migration } from '@mikro-orm/migrations';

export class Migration20260108_009_AddLeaseNotes extends Migration {

    async up(): Promise<void> {
        this.addSql(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leases' AND column_name='notes') THEN 
                    ALTER TABLE leases ADD COLUMN notes TEXT; 
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leases' AND column_name='contract_pdf_path') THEN 
                    ALTER TABLE leases ADD COLUMN contract_pdf_path VARCHAR(255); 
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leases' AND column_name='original_end_date') THEN 
                    ALTER TABLE leases ADD COLUMN original_end_date DATE; 
                END IF;
                 IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leases' AND column_name='renewal_count') THEN 
                    ALTER TABLE leases ADD COLUMN renewal_count INTEGER DEFAULT 0; 
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leases' AND column_name='notice_required_days') THEN 
                    ALTER TABLE leases ADD COLUMN notice_required_days INTEGER DEFAULT 90; 
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leases' AND column_name='early_termination_penalty') THEN 
                    ALTER TABLE leases ADD COLUMN early_termination_penalty DECIMAL(15,2); 
                END IF;
                 IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leases' AND column_name='last_increase_date') THEN 
                    ALTER TABLE leases ADD COLUMN last_increase_date DATE; 
                END IF;
            END $$;
        `);
    }

    async down(): Promise<void> {
        // This is a "catch up" migration for fields that might be missing, 
        // reverting them is risky if they were added by other means, but standard practice is to drop what we added.
        // Given the idempotent check in UP, DOWN is tricky. For now, strict reversal:
        // But since I'm batching missing fields I saw in the entity vs initial schema:
        this.addSql(`
            ALTER TABLE leases 
            DROP COLUMN IF EXISTS notes,
            DROP COLUMN IF EXISTS contract_pdf_path,
            DROP COLUMN IF EXISTS original_end_date,
            DROP COLUMN IF EXISTS renewal_count,
            DROP COLUMN IF EXISTS notice_required_days,
            DROP COLUMN IF EXISTS early_termination_penalty,
            DROP COLUMN IF EXISTS last_increase_date;
         `);
    }

}
