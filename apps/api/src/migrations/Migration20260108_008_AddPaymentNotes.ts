import { Migration } from '@mikro-orm/migrations';

export class Migration20260108_008_AddPaymentNotes extends Migration {

    async up(): Promise<void> {
        this.addSql(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='notes') THEN 
                    ALTER TABLE payments ADD COLUMN notes TEXT; 
                END IF; 
            END $$;
        `);
    }

    async down(): Promise<void> {
        this.addSql(`
            ALTER TABLE payments 
            DROP COLUMN notes;
        `);
    }

}
