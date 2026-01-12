import { Migration } from '@mikro-orm/migrations';

export class Migration20260112040000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "contract_templates" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "tenant_id" uuid not null, "name" varchar(255) not null, "content" text not null, "is_active" boolean not null default true, constraint "contract_templates_pkey" primary key ("id"));`);

    this.addSql(`alter table "leases" add column "contract_content" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "contract_templates" cascade;`);

    this.addSql(`alter table "leases" drop column "contract_content";`);
  }

}
