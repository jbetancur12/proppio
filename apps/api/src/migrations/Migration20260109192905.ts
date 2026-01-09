import { Migration } from '@mikro-orm/migrations';

export class Migration20260109192905 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "leases" add column "first_payment_date" date null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "leases" drop column "first_payment_date";`);
  }

}
