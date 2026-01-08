import { Migration } from '@mikro-orm/migrations';

export class Migration20260108_007_PaymentSchema extends Migration {

    async up(): Promise<void> {
        // Add new columns
        this.addSql(`
            ALTER TABLE payments 
            ADD COLUMN period_start DATE,
            ADD COLUMN period_end DATE,
            ADD COLUMN reference VARCHAR(255);
        `);

        // Rename payment_method to method to match entity definition
        this.addSql(`
            ALTER TABLE payments 
            RENAME COLUMN payment_method TO method;
        `);

        // Backfill existing data to avoid NOT NULL violation
        // We assume period covers 1 month starting from payment date for existing records
        this.addSql(`
            UPDATE payments 
            SET period_start = payment_date, 
                period_end = (payment_date + interval '1 month')::date 
            WHERE period_start IS NULL;
        `);

        // Now set NOT NULL constraints
        this.addSql(`
            ALTER TABLE payments 
            ALTER COLUMN period_start SET NOT NULL,
            ALTER COLUMN period_end SET NOT NULL;
        `);
    }

    async down(): Promise<void> {
        this.addSql(`
            ALTER TABLE payments 
            RENAME COLUMN method TO payment_method;
        `);

        this.addSql(`
            ALTER TABLE payments 
            DROP COLUMN period_start,
            DROP COLUMN period_end,
            DROP COLUMN reference;
        `);
    }

}
