import { Migration } from '@mikro-orm/migrations';

export class Migration20260109022212_InitialSchema extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "properties" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "tenant_id" uuid not null, "name" varchar(255) not null, "address" varchar(255) not null, constraint "properties_pkey" primary key ("id"));`);

    this.addSql(`create table "renters" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "tenant_id" uuid not null, "first_name" varchar(255) not null, "last_name" varchar(255) not null, "email" varchar(255) null, "phone" varchar(255) not null, "identification" varchar(255) not null, constraint "renters_pkey" primary key ("id"));`);

    this.addSql(`create table "tenants" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "name" varchar(255) not null, "slug" varchar(255) not null, "status" text check ("status" in ('ACTIVE', 'SUSPENDED')) not null default 'ACTIVE', "plan" varchar(255) null, "config" jsonb null, constraint "tenants_pkey" primary key ("id"));`);
    this.addSql(`alter table "tenants" add constraint "tenants_slug_unique" unique ("slug");`);

    this.addSql(`create table "treasury_transactions" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "tenant_id" uuid not null, "date" date not null, "amount" numeric(12,2) not null, "type" text check ("type" in ('INCOME', 'EXPENSE')) not null, "category" text check ("category" in ('INVESTMENT', 'LOAN', 'REFUND', 'OTHER_INCOME', 'SALARY', 'TAXES', 'SERVICES', 'MARKETING', 'LEGAL', 'OFFICE', 'WITHDRAWAL', 'OTHER_EXPENSE')) not null, "description" text null, "reference" varchar(255) null, constraint "treasury_transactions_pkey" primary key ("id"));`);

    this.addSql(`create table "units" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "tenant_id" uuid not null, "name" varchar(255) not null, "type" varchar(255) null, "area" int null, "bedrooms" int null, "bathrooms" int null, "status" text check ("status" in ('VACANT', 'OCCUPIED', 'MAINTENANCE')) not null default 'VACANT', "base_rent" int null, "property_id" uuid not null, constraint "units_pkey" primary key ("id"));`);

    this.addSql(`create table "maintenance_tickets" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "tenant_id" uuid not null, "title" varchar(255) not null, "description" text not null, "status" text check ("status" in ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')) not null default 'OPEN', "priority" text check ("priority" in ('LOW', 'MEDIUM', 'HIGH', 'URGENT')) not null default 'MEDIUM', "unit_id" uuid not null, "renter_id" uuid null, "images" jsonb null, "resolved_at" date null, constraint "maintenance_tickets_pkey" primary key ("id"));`);

    this.addSql(`create table "leases" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "tenant_id" uuid not null, "unit_id" uuid not null, "renter_id" uuid not null, "start_date" date not null, "end_date" date not null, "monthly_rent" int not null, "security_deposit" int null, "status" text check ("status" in ('DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED')) not null default 'DRAFT', "notes" varchar(255) null, "contract_pdf_path" varchar(255) null, "original_end_date" date null, "renewal_count" int not null default 0, "notice_required_days" int not null default 90, "early_termination_penalty" int null, "last_increase_date" date null, constraint "leases_pkey" primary key ("id"));`);

    this.addSql(`create table "rent_increases" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "tenant_id" uuid not null, "lease_id" uuid not null, "old_rent" int not null, "new_rent" int not null, "increase_percentage" int not null, "effective_date" date not null, "reason" varchar(255) null, "applied_by" varchar(255) not null, constraint "rent_increases_pkey" primary key ("id"));`);

    this.addSql(`create table "payments" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "tenant_id" uuid not null, "lease_id" uuid not null, "amount" int not null, "payment_date" date not null, "period_start" date not null, "period_end" date not null, "method" text check ("method" in ('CASH', 'TRANSFER', 'CHECK', 'CARD', 'OTHER')) not null default 'TRANSFER', "status" text check ("status" in ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')) not null default 'COMPLETED', "reference" varchar(255) null, "notes" varchar(255) null, constraint "payments_pkey" primary key ("id"));`);

    this.addSql(`create table "exit_notices" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "tenant_id" uuid not null, "lease_id" uuid not null, "notice_date" date not null, "planned_exit_date" date not null, "reason" text null, "mutual_agreement" boolean not null default false, "penalty_amount" int null, "penalty_waived" boolean not null default false, "status" text check ("status" in ('PENDING', 'CONFIRMED', 'CANCELLED')) not null default 'PENDING', constraint "exit_notices_pkey" primary key ("id"));`);

    this.addSql(`create table "expenses" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "tenant_id" uuid not null, "description" varchar(255) not null, "amount" int not null, "date" date not null, "category" text check ("category" in ('MAINTENANCE', 'REPAIRS', 'UTILITIES', 'TAXES', 'MANAGEMENT', 'INSURANCE', 'OTHER')) not null default 'MAINTENANCE', "status" text check ("status" in ('PENDING', 'PAID', 'CANCELLED')) not null default 'PENDING', "property_id" uuid not null, "unit_id" uuid null, "supplier" varchar(255) null, "invoice_number" varchar(255) null, constraint "expenses_pkey" primary key ("id"));`);

    this.addSql(`create table "users" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "email" varchar(255) not null, "password_hash" varchar(255) not null, "first_name" varchar(255) null, "last_name" varchar(255) null, "global_role" text check ("global_role" in ('SUPER_ADMIN', 'USER')) not null default 'USER', constraint "users_pkey" primary key ("id"));`);
    this.addSql(`alter table "users" add constraint "users_email_unique" unique ("email");`);

    this.addSql(`create table "tenant_users" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "tenant_id" uuid not null, "user_id" uuid not null, "role" text check ("role" in ('ADMIN', 'MEMBER')) not null, constraint "tenant_users_pkey" primary key ("id"));`);

    this.addSql(`create table "audit_logs" ("id" uuid not null default gen_random_uuid(), "tenant_id" uuid null, "user_id" uuid not null, "action" varchar(255) not null, "resource_type" varchar(255) null, "resource_id" uuid null, "old_values" jsonb null, "new_values" jsonb null, "ip_address" varchar(255) null, "user_agent" text null, "created_at" timestamptz not null, constraint "audit_logs_pkey" primary key ("id"));`);
    this.addSql(`create index "audit_logs_tenant_id_index" on "audit_logs" ("tenant_id");`);
    this.addSql(`create index "audit_logs_user_id_index" on "audit_logs" ("user_id");`);
    this.addSql(`create index "audit_logs_created_at_index" on "audit_logs" ("created_at");`);

    this.addSql(`alter table "units" add constraint "units_property_id_foreign" foreign key ("property_id") references "properties" ("id") on update cascade;`);

    this.addSql(`alter table "maintenance_tickets" add constraint "maintenance_tickets_unit_id_foreign" foreign key ("unit_id") references "units" ("id") on update cascade;`);
    this.addSql(`alter table "maintenance_tickets" add constraint "maintenance_tickets_renter_id_foreign" foreign key ("renter_id") references "renters" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "leases" add constraint "leases_unit_id_foreign" foreign key ("unit_id") references "units" ("id") on update cascade;`);
    this.addSql(`alter table "leases" add constraint "leases_renter_id_foreign" foreign key ("renter_id") references "renters" ("id") on update cascade;`);

    this.addSql(`alter table "rent_increases" add constraint "rent_increases_lease_id_foreign" foreign key ("lease_id") references "leases" ("id") on update cascade;`);

    this.addSql(`alter table "payments" add constraint "payments_lease_id_foreign" foreign key ("lease_id") references "leases" ("id") on update cascade;`);

    this.addSql(`alter table "exit_notices" add constraint "exit_notices_lease_id_foreign" foreign key ("lease_id") references "leases" ("id") on update cascade;`);

    this.addSql(`alter table "expenses" add constraint "expenses_property_id_foreign" foreign key ("property_id") references "properties" ("id") on update cascade;`);
    this.addSql(`alter table "expenses" add constraint "expenses_unit_id_foreign" foreign key ("unit_id") references "units" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "tenant_users" add constraint "tenant_users_tenant_id_foreign" foreign key ("tenant_id") references "tenants" ("id") on update cascade;`);
    this.addSql(`alter table "tenant_users" add constraint "tenant_users_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`);

    this.addSql(`alter table "audit_logs" add constraint "audit_logs_tenant_id_foreign" foreign key ("tenant_id") references "tenants" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "audit_logs" add constraint "audit_logs_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade on delete cascade;`);
  }

}
