import { Migration } from '@mikro-orm/migrations';

export class Migration20260108183127 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "treasury_transactions" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "tenant_id" uuid not null, "date" date not null, "amount" numeric(12,2) not null, "type" text check ("type" in ('INCOME', 'EXPENSE')) not null, "category" text check ("category" in ('INVESTMENT', 'LOAN', 'REFUND', 'OTHER_INCOME', 'SALARY', 'TAXES', 'SERVICES', 'MARKETING', 'LEGAL', 'OFFICE', 'WITHDRAWAL', 'OTHER_EXPENSE')) not null, "description" text null, "reference" varchar(255) null, constraint "treasury_transactions_pkey" primary key ("id"));`);

    this.addSql(`create table "audit_logs" ("id" uuid not null default gen_random_uuid(), "tenant_id" uuid null, "user_id" uuid not null, "action" varchar(255) not null, "resource_type" varchar(255) null, "resource_id" uuid null, "old_values" jsonb null, "new_values" jsonb null, "ip_address" varchar(255) null, "user_agent" text null, "created_at" timestamptz not null, constraint "audit_logs_pkey" primary key ("id"));`);
    this.addSql(`create index "audit_logs_tenant_id_index" on "audit_logs" ("tenant_id");`);
    this.addSql(`create index "audit_logs_user_id_index" on "audit_logs" ("user_id");`);
    this.addSql(`create index "audit_logs_created_at_index" on "audit_logs" ("created_at");`);

    this.addSql(`alter table "audit_logs" add constraint "audit_logs_tenant_id_foreign" foreign key ("tenant_id") references "tenants" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "audit_logs" add constraint "audit_logs_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table "properties" drop constraint "properties_tenant_id_fkey";`);

    this.addSql(`alter table "units" drop constraint "units_property_id_fkey";`);

    this.addSql(`alter table "maintenance_tickets" drop constraint "maintenance_tickets_renter_id_fkey";`);
    this.addSql(`alter table "maintenance_tickets" drop constraint "maintenance_tickets_unit_id_fkey";`);

    this.addSql(`alter table "leases" drop constraint "leases_renter_id_fkey";`);
    this.addSql(`alter table "leases" drop constraint "leases_unit_id_fkey";`);

    this.addSql(`alter table "rent_increases" drop constraint "rent_increases_lease_id_fkey";`);

    this.addSql(`alter table "payments" drop constraint "payments_lease_id_fkey";`);

    this.addSql(`alter table "expenses" drop constraint "expenses_property_id_fkey";`);
    this.addSql(`alter table "expenses" drop constraint "expenses_unit_id_fkey";`);

    this.addSql(`alter table "tenant_users" drop constraint "tenant_users_tenant_id_fkey";`);
    this.addSql(`alter table "tenant_users" drop constraint "tenant_users_user_id_fkey";`);

    this.addSql(`drop index "idx_properties_tenant";`);

    this.addSql(`alter table "properties" alter column "id" drop default;`);
    this.addSql(`alter table "properties" alter column "id" drop default;`);
    this.addSql(`alter table "properties" alter column "id" type uuid using ("id"::text::uuid);`);
    this.addSql(`alter table "properties" alter column "address" type varchar(255) using ("address"::varchar(255));`);
    this.addSql(`alter table "properties" alter column "created_at" drop default;`);
    this.addSql(`alter table "properties" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "properties" alter column "updated_at" drop default;`);
    this.addSql(`alter table "properties" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);

    this.addSql(`drop index "idx_renters_tenant";`);

    this.addSql(`alter table "renters" alter column "id" drop default;`);
    this.addSql(`alter table "renters" alter column "id" drop default;`);
    this.addSql(`alter table "renters" alter column "id" type uuid using ("id"::text::uuid);`);
    this.addSql(`alter table "renters" alter column "phone" type varchar(255) using ("phone"::varchar(255));`);
    this.addSql(`alter table "renters" alter column "identification" type varchar(255) using ("identification"::varchar(255));`);
    this.addSql(`alter table "renters" alter column "created_at" drop default;`);
    this.addSql(`alter table "renters" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "renters" alter column "updated_at" drop default;`);
    this.addSql(`alter table "renters" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);

    this.addSql(`drop index "idx_tenants_slug";`);

    this.addSql(`alter table "tenants" alter column "id" drop default;`);
    this.addSql(`alter table "tenants" alter column "id" drop default;`);
    this.addSql(`alter table "tenants" alter column "id" type uuid using ("id"::text::uuid);`);
    this.addSql(`alter table "tenants" alter column "slug" type varchar(255) using ("slug"::varchar(255));`);
    this.addSql(`alter table "tenants" alter column "slug" set not null;`);
    this.addSql(`alter table "tenants" alter column "status" type text using ("status"::text);`);
    this.addSql(`alter table "tenants" alter column "plan" drop default;`);
    this.addSql(`alter table "tenants" alter column "plan" type varchar(255) using ("plan"::varchar(255));`);
    this.addSql(`alter table "tenants" alter column "plan" drop not null;`);
    this.addSql(`alter table "tenants" alter column "created_at" drop default;`);
    this.addSql(`alter table "tenants" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "tenants" alter column "updated_at" drop default;`);
    this.addSql(`alter table "tenants" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "tenants" add constraint "tenants_status_check" check("status" in ('ACTIVE', 'SUSPENDED'));`);
    this.addSql(`alter table "tenants" drop constraint "tenants_slug_key";`);
    this.addSql(`alter table "tenants" add constraint "tenants_slug_unique" unique ("slug");`);

    this.addSql(`drop index "idx_units_property";`);
    this.addSql(`drop index "idx_units_tenant";`);

    this.addSql(`alter table "units" alter column "id" drop default;`);
    this.addSql(`alter table "units" alter column "id" drop default;`);
    this.addSql(`alter table "units" alter column "id" type uuid using ("id"::text::uuid);`);
    this.addSql(`alter table "units" alter column "type" type varchar(255) using ("type"::varchar(255));`);
    this.addSql(`alter table "units" alter column "area" type int using ("area"::int);`);
    this.addSql(`alter table "units" alter column "bathrooms" type int using ("bathrooms"::int);`);
    this.addSql(`alter table "units" alter column "status" type text using ("status"::text);`);
    this.addSql(`alter table "units" alter column "base_rent" type int using ("base_rent"::int);`);
    this.addSql(`alter table "units" alter column "created_at" drop default;`);
    this.addSql(`alter table "units" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "units" alter column "updated_at" drop default;`);
    this.addSql(`alter table "units" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "units" add constraint "units_status_check" check("status" in ('VACANT', 'OCCUPIED', 'MAINTENANCE'));`);
    this.addSql(`alter table "units" add constraint "units_property_id_foreign" foreign key ("property_id") references "properties" ("id") on update cascade;`);

    this.addSql(`drop index "idx_maintenance_tenant";`);
    this.addSql(`drop index "idx_maintenance_unit";`);

    this.addSql(`alter table "maintenance_tickets" add column "images" jsonb null, add column "resolved_at" date null;`);
    this.addSql(`alter table "maintenance_tickets" alter column "id" drop default;`);
    this.addSql(`alter table "maintenance_tickets" alter column "id" drop default;`);
    this.addSql(`alter table "maintenance_tickets" alter column "id" type uuid using ("id"::text::uuid);`);
    this.addSql(`alter table "maintenance_tickets" alter column "priority" type text using ("priority"::text);`);
    this.addSql(`alter table "maintenance_tickets" alter column "status" type text using ("status"::text);`);
    this.addSql(`alter table "maintenance_tickets" alter column "created_at" drop default;`);
    this.addSql(`alter table "maintenance_tickets" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "maintenance_tickets" alter column "updated_at" drop default;`);
    this.addSql(`alter table "maintenance_tickets" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "maintenance_tickets" add constraint "maintenance_tickets_priority_check" check("priority" in ('LOW', 'MEDIUM', 'HIGH', 'URGENT'));`);
    this.addSql(`alter table "maintenance_tickets" add constraint "maintenance_tickets_status_check" check("status" in ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'));`);
    this.addSql(`alter table "maintenance_tickets" add constraint "maintenance_tickets_unit_id_foreign" foreign key ("unit_id") references "units" ("id") on update cascade;`);
    this.addSql(`alter table "maintenance_tickets" add constraint "maintenance_tickets_renter_id_foreign" foreign key ("renter_id") references "renters" ("id") on update cascade on delete set null;`);

    this.addSql(`drop index "idx_leases_renter";`);
    this.addSql(`drop index "idx_leases_tenant";`);
    this.addSql(`drop index "idx_leases_unit";`);

    this.addSql(`alter table "leases" alter column "id" drop default;`);
    this.addSql(`alter table "leases" alter column "id" drop default;`);
    this.addSql(`alter table "leases" alter column "id" type uuid using ("id"::text::uuid);`);
    this.addSql(`alter table "leases" alter column "monthly_rent" type int using ("monthly_rent"::int);`);
    this.addSql(`alter table "leases" alter column "security_deposit" type int using ("security_deposit"::int);`);
    this.addSql(`alter table "leases" alter column "status" type text using ("status"::text);`);
    this.addSql(`alter table "leases" alter column "created_at" drop default;`);
    this.addSql(`alter table "leases" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "leases" alter column "updated_at" drop default;`);
    this.addSql(`alter table "leases" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "leases" alter column "early_termination_penalty" type int using ("early_termination_penalty"::int);`);
    this.addSql(`alter table "leases" alter column "notes" type varchar(255) using ("notes"::varchar(255));`);
    this.addSql(`alter table "leases" add constraint "leases_status_check" check("status" in ('DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED'));`);
    this.addSql(`alter table "leases" add constraint "leases_unit_id_foreign" foreign key ("unit_id") references "units" ("id") on update cascade;`);
    this.addSql(`alter table "leases" add constraint "leases_renter_id_foreign" foreign key ("renter_id") references "renters" ("id") on update cascade;`);

    this.addSql(`drop index "idx_rent_increases_lease";`);
    this.addSql(`drop index "idx_rent_increases_tenant";`);

    this.addSql(`alter table "rent_increases" alter column "id" drop default;`);
    this.addSql(`alter table "rent_increases" alter column "id" drop default;`);
    this.addSql(`alter table "rent_increases" alter column "id" type uuid using ("id"::text::uuid);`);
    this.addSql(`alter table "rent_increases" alter column "old_rent" type int using ("old_rent"::int);`);
    this.addSql(`alter table "rent_increases" alter column "new_rent" type int using ("new_rent"::int);`);
    this.addSql(`alter table "rent_increases" alter column "increase_percentage" type int using ("increase_percentage"::int);`);
    this.addSql(`alter table "rent_increases" alter column "created_at" drop default;`);
    this.addSql(`alter table "rent_increases" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "rent_increases" alter column "updated_at" drop default;`);
    this.addSql(`alter table "rent_increases" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "rent_increases" add constraint "rent_increases_lease_id_foreign" foreign key ("lease_id") references "leases" ("id") on update cascade;`);

    this.addSql(`drop index "idx_payments_lease";`);
    this.addSql(`drop index "idx_payments_tenant";`);

    this.addSql(`alter table "payments" alter column "id" drop default;`);
    this.addSql(`alter table "payments" alter column "id" drop default;`);
    this.addSql(`alter table "payments" alter column "id" type uuid using ("id"::text::uuid);`);
    this.addSql(`alter table "payments" alter column "amount" type int using ("amount"::int);`);
    this.addSql(`alter table "payments" alter column "method" type text using ("method"::text);`);
    this.addSql(`alter table "payments" alter column "method" set default 'TRANSFER';`);
    this.addSql(`alter table "payments" alter column "status" type text using ("status"::text);`);
    this.addSql(`alter table "payments" alter column "status" set default 'COMPLETED';`);
    this.addSql(`alter table "payments" alter column "notes" type varchar(255) using ("notes"::varchar(255));`);
    this.addSql(`alter table "payments" alter column "created_at" drop default;`);
    this.addSql(`alter table "payments" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "payments" alter column "updated_at" drop default;`);
    this.addSql(`alter table "payments" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "payments" add constraint "payments_method_check" check("method" in ('CASH', 'TRANSFER', 'CHECK', 'CARD', 'OTHER'));`);
    this.addSql(`alter table "payments" add constraint "payments_status_check" check("status" in ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'));`);
    this.addSql(`alter table "payments" add constraint "payments_lease_id_foreign" foreign key ("lease_id") references "leases" ("id") on update cascade;`);

    this.addSql(`drop index "idx_exit_notices_lease";`);
    this.addSql(`drop index "idx_exit_notices_status";`);
    this.addSql(`drop index "idx_exit_notices_tenant";`);

    this.addSql(`alter table "exit_notices" alter column "id" drop default;`);
    this.addSql(`alter table "exit_notices" alter column "id" drop default;`);
    this.addSql(`alter table "exit_notices" alter column "id" type uuid using ("id"::text::uuid);`);
    this.addSql(`alter table "exit_notices" alter column "penalty_amount" type int using ("penalty_amount"::int);`);
    this.addSql(`alter table "exit_notices" alter column "status" type text using ("status"::text);`);
    this.addSql(`alter table "exit_notices" alter column "created_at" drop default;`);
    this.addSql(`alter table "exit_notices" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "exit_notices" alter column "updated_at" drop default;`);
    this.addSql(`alter table "exit_notices" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "exit_notices" add constraint "exit_notices_status_check" check("status" in ('PENDING', 'CONFIRMED', 'CANCELLED'));`);
    this.addSql(`alter table "exit_notices" add constraint "exit_notices_lease_id_foreign" foreign key ("lease_id") references "leases" ("id") on update cascade;`);

    this.addSql(`drop index "idx_expenses_property";`);
    this.addSql(`drop index "idx_expenses_tenant";`);

    this.addSql(`alter table "expenses" add column "supplier" varchar(255) null, add column "invoice_number" varchar(255) null;`);
    this.addSql(`alter table "expenses" alter column "id" drop default;`);
    this.addSql(`alter table "expenses" alter column "id" drop default;`);
    this.addSql(`alter table "expenses" alter column "id" type uuid using ("id"::text::uuid);`);
    this.addSql(`alter table "expenses" alter column "description" type varchar(255) using ("description"::varchar(255));`);
    this.addSql(`alter table "expenses" alter column "amount" type int using ("amount"::int);`);
    this.addSql(`alter table "expenses" alter column "category" type text using ("category"::text);`);
    this.addSql(`alter table "expenses" alter column "category" set default 'MAINTENANCE';`);
    this.addSql(`alter table "expenses" alter column "status" type text using ("status"::text);`);
    this.addSql(`alter table "expenses" alter column "created_at" drop default;`);
    this.addSql(`alter table "expenses" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "expenses" alter column "updated_at" drop default;`);
    this.addSql(`alter table "expenses" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "expenses" add constraint "expenses_category_check" check("category" in ('MAINTENANCE', 'REPAIRS', 'UTILITIES', 'TAXES', 'MANAGEMENT', 'INSURANCE', 'OTHER'));`);
    this.addSql(`alter table "expenses" add constraint "expenses_status_check" check("status" in ('PENDING', 'PAID', 'CANCELLED'));`);
    this.addSql(`alter table "expenses" add constraint "expenses_property_id_foreign" foreign key ("property_id") references "properties" ("id") on update cascade;`);
    this.addSql(`alter table "expenses" add constraint "expenses_unit_id_foreign" foreign key ("unit_id") references "units" ("id") on update cascade on delete set null;`);

    this.addSql(`drop index "idx_users_email";`);
    this.addSql(`drop index "idx_users_global_role";`);

    this.addSql(`alter table "users" alter column "id" drop default;`);
    this.addSql(`alter table "users" alter column "id" drop default;`);
    this.addSql(`alter table "users" alter column "id" type uuid using ("id"::text::uuid);`);
    this.addSql(`alter table "users" alter column "global_role" type text using ("global_role"::text);`);
    this.addSql(`alter table "users" alter column "created_at" drop default;`);
    this.addSql(`alter table "users" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "users" alter column "updated_at" drop default;`);
    this.addSql(`alter table "users" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "users" add constraint "users_global_role_check" check("global_role" in ('SUPER_ADMIN', 'USER'));`);
    this.addSql(`alter table "users" drop constraint "users_email_key";`);
    this.addSql(`alter table "users" add constraint "users_email_unique" unique ("email");`);

    this.addSql(`drop index "idx_tenant_users_tenant";`);
    this.addSql(`drop index "idx_tenant_users_user";`);
    this.addSql(`alter table "tenant_users" drop constraint "tenant_users_tenant_id_user_id_key";`);

    this.addSql(`alter table "tenant_users" alter column "id" drop default;`);
    this.addSql(`alter table "tenant_users" alter column "id" drop default;`);
    this.addSql(`alter table "tenant_users" alter column "id" type uuid using ("id"::text::uuid);`);
    this.addSql(`alter table "tenant_users" alter column "role" type text using ("role"::text);`);
    this.addSql(`alter table "tenant_users" alter column "created_at" drop default;`);
    this.addSql(`alter table "tenant_users" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "tenant_users" alter column "updated_at" drop default;`);
    this.addSql(`alter table "tenant_users" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "tenant_users" add constraint "tenant_users_role_check" check("role" in ('ADMIN', 'MEMBER'));`);
    this.addSql(`alter table "tenant_users" add constraint "tenant_users_tenant_id_foreign" foreign key ("tenant_id") references "tenants" ("id") on update cascade;`);
    this.addSql(`alter table "tenant_users" add constraint "tenant_users_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "treasury_transactions" cascade;`);

    this.addSql(`drop table if exists "audit_logs" cascade;`);

    this.addSql(`alter table "exit_notices" drop constraint if exists "exit_notices_status_check";`);

    this.addSql(`alter table "exit_notices" drop constraint "exit_notices_lease_id_foreign";`);

    this.addSql(`alter table "expenses" drop constraint if exists "expenses_category_check";`);
    this.addSql(`alter table "expenses" drop constraint if exists "expenses_status_check";`);

    this.addSql(`alter table "expenses" drop constraint "expenses_property_id_foreign";`);
    this.addSql(`alter table "expenses" drop constraint "expenses_unit_id_foreign";`);

    this.addSql(`alter table "leases" drop constraint if exists "leases_status_check";`);

    this.addSql(`alter table "leases" drop constraint "leases_unit_id_foreign";`);
    this.addSql(`alter table "leases" drop constraint "leases_renter_id_foreign";`);

    this.addSql(`alter table "maintenance_tickets" drop constraint if exists "maintenance_tickets_status_check";`);
    this.addSql(`alter table "maintenance_tickets" drop constraint if exists "maintenance_tickets_priority_check";`);

    this.addSql(`alter table "maintenance_tickets" drop constraint "maintenance_tickets_unit_id_foreign";`);
    this.addSql(`alter table "maintenance_tickets" drop constraint "maintenance_tickets_renter_id_foreign";`);

    this.addSql(`alter table "payments" drop constraint if exists "payments_method_check";`);
    this.addSql(`alter table "payments" drop constraint if exists "payments_status_check";`);

    this.addSql(`alter table "payments" drop constraint "payments_lease_id_foreign";`);

    this.addSql(`alter table "rent_increases" drop constraint "rent_increases_lease_id_foreign";`);

    this.addSql(`alter table "tenant_users" drop constraint if exists "tenant_users_role_check";`);

    this.addSql(`alter table "tenant_users" drop constraint "tenant_users_tenant_id_foreign";`);
    this.addSql(`alter table "tenant_users" drop constraint "tenant_users_user_id_foreign";`);

    this.addSql(`alter table "tenants" drop constraint if exists "tenants_status_check";`);

    this.addSql(`alter table "units" drop constraint if exists "units_status_check";`);

    this.addSql(`alter table "units" drop constraint "units_property_id_foreign";`);

    this.addSql(`alter table "users" drop constraint if exists "users_global_role_check";`);

    this.addSql(`alter table "exit_notices" alter column "id" drop default;`);
    this.addSql(`alter table "exit_notices" alter column "id" type uuid using ("id"::text::uuid);`);
    this.addSql(`alter table "exit_notices" alter column "id" set default gen_random_uuid();`);
    this.addSql(`alter table "exit_notices" alter column "created_at" type timestamp(6) using ("created_at"::timestamp(6));`);
    this.addSql(`alter table "exit_notices" alter column "created_at" set default now();`);
    this.addSql(`alter table "exit_notices" alter column "updated_at" type timestamp(6) using ("updated_at"::timestamp(6));`);
    this.addSql(`alter table "exit_notices" alter column "updated_at" set default now();`);
    this.addSql(`alter table "exit_notices" alter column "penalty_amount" type numeric(15,2) using ("penalty_amount"::numeric(15,2));`);
    this.addSql(`alter table "exit_notices" alter column "status" type varchar(20) using ("status"::varchar(20));`);
    this.addSql(`create index "idx_exit_notices_lease" on "exit_notices" ("lease_id");`);
    this.addSql(`create index "idx_exit_notices_status" on "exit_notices" ("status");`);
    this.addSql(`create index "idx_exit_notices_tenant" on "exit_notices" ("tenant_id");`);

    this.addSql(`alter table "expenses" drop column "supplier", drop column "invoice_number";`);

    this.addSql(`alter table "expenses" alter column "id" drop default;`);
    this.addSql(`alter table "expenses" alter column "id" type uuid using ("id"::text::uuid);`);
    this.addSql(`alter table "expenses" alter column "id" set default gen_random_uuid();`);
    this.addSql(`alter table "expenses" alter column "created_at" type timestamp(6) using ("created_at"::timestamp(6));`);
    this.addSql(`alter table "expenses" alter column "created_at" set default now();`);
    this.addSql(`alter table "expenses" alter column "updated_at" type timestamp(6) using ("updated_at"::timestamp(6));`);
    this.addSql(`alter table "expenses" alter column "updated_at" set default now();`);
    this.addSql(`alter table "expenses" alter column "description" type text using ("description"::text);`);
    this.addSql(`alter table "expenses" alter column "amount" type numeric(15,2) using ("amount"::numeric(15,2));`);
    this.addSql(`alter table "expenses" alter column "category" drop default;`);
    this.addSql(`alter table "expenses" alter column "category" type varchar(100) using ("category"::varchar(100));`);
    this.addSql(`alter table "expenses" alter column "status" type varchar(50) using ("status"::varchar(50));`);
    this.addSql(`alter table "expenses" add constraint "expenses_property_id_fkey" foreign key ("property_id") references "properties" ("id") on update no action on delete no action;`);
    this.addSql(`alter table "expenses" add constraint "expenses_unit_id_fkey" foreign key ("unit_id") references "units" ("id") on update no action on delete no action;`);
    this.addSql(`create index "idx_expenses_property" on "expenses" ("property_id");`);
    this.addSql(`create index "idx_expenses_tenant" on "expenses" ("tenant_id");`);

    this.addSql(`alter table "leases" alter column "id" drop default;`);
    this.addSql(`alter table "leases" alter column "id" type uuid using ("id"::text::uuid);`);
    this.addSql(`alter table "leases" alter column "id" set default gen_random_uuid();`);
    this.addSql(`alter table "leases" alter column "created_at" type timestamp(6) using ("created_at"::timestamp(6));`);
    this.addSql(`alter table "leases" alter column "created_at" set default now();`);
    this.addSql(`alter table "leases" alter column "updated_at" type timestamp(6) using ("updated_at"::timestamp(6));`);
    this.addSql(`alter table "leases" alter column "updated_at" set default now();`);
    this.addSql(`alter table "leases" alter column "monthly_rent" type numeric(15,2) using ("monthly_rent"::numeric(15,2));`);
    this.addSql(`alter table "leases" alter column "security_deposit" type numeric(15,2) using ("security_deposit"::numeric(15,2));`);
    this.addSql(`alter table "leases" alter column "status" type varchar(50) using ("status"::varchar(50));`);
    this.addSql(`alter table "leases" alter column "notes" type text using ("notes"::text);`);
    this.addSql(`alter table "leases" alter column "early_termination_penalty" type numeric(15,2) using ("early_termination_penalty"::numeric(15,2));`);
    this.addSql(`alter table "leases" add constraint "leases_renter_id_fkey" foreign key ("renter_id") references "renters" ("id") on update no action on delete no action;`);
    this.addSql(`alter table "leases" add constraint "leases_unit_id_fkey" foreign key ("unit_id") references "units" ("id") on update no action on delete no action;`);
    this.addSql(`create index "idx_leases_renter" on "leases" ("renter_id");`);
    this.addSql(`create index "idx_leases_tenant" on "leases" ("tenant_id");`);
    this.addSql(`create index "idx_leases_unit" on "leases" ("unit_id");`);

    this.addSql(`alter table "maintenance_tickets" drop column "images", drop column "resolved_at";`);

    this.addSql(`alter table "maintenance_tickets" alter column "id" drop default;`);
    this.addSql(`alter table "maintenance_tickets" alter column "id" type uuid using ("id"::text::uuid);`);
    this.addSql(`alter table "maintenance_tickets" alter column "id" set default gen_random_uuid();`);
    this.addSql(`alter table "maintenance_tickets" alter column "created_at" type timestamp(6) using ("created_at"::timestamp(6));`);
    this.addSql(`alter table "maintenance_tickets" alter column "created_at" set default now();`);
    this.addSql(`alter table "maintenance_tickets" alter column "updated_at" type timestamp(6) using ("updated_at"::timestamp(6));`);
    this.addSql(`alter table "maintenance_tickets" alter column "updated_at" set default now();`);
    this.addSql(`alter table "maintenance_tickets" alter column "status" type varchar(50) using ("status"::varchar(50));`);
    this.addSql(`alter table "maintenance_tickets" alter column "priority" type varchar(50) using ("priority"::varchar(50));`);
    this.addSql(`alter table "maintenance_tickets" add constraint "maintenance_tickets_renter_id_fkey" foreign key ("renter_id") references "renters" ("id") on update no action on delete no action;`);
    this.addSql(`alter table "maintenance_tickets" add constraint "maintenance_tickets_unit_id_fkey" foreign key ("unit_id") references "units" ("id") on update no action on delete no action;`);
    this.addSql(`create index "idx_maintenance_tenant" on "maintenance_tickets" ("tenant_id");`);
    this.addSql(`create index "idx_maintenance_unit" on "maintenance_tickets" ("unit_id");`);

    this.addSql(`alter table "payments" alter column "id" drop default;`);
    this.addSql(`alter table "payments" alter column "id" type uuid using ("id"::text::uuid);`);
    this.addSql(`alter table "payments" alter column "id" set default gen_random_uuid();`);
    this.addSql(`alter table "payments" alter column "created_at" type timestamp(6) using ("created_at"::timestamp(6));`);
    this.addSql(`alter table "payments" alter column "created_at" set default now();`);
    this.addSql(`alter table "payments" alter column "updated_at" type timestamp(6) using ("updated_at"::timestamp(6));`);
    this.addSql(`alter table "payments" alter column "updated_at" set default now();`);
    this.addSql(`alter table "payments" alter column "amount" type numeric(15,2) using ("amount"::numeric(15,2));`);
    this.addSql(`alter table "payments" alter column "method" drop default;`);
    this.addSql(`alter table "payments" alter column "method" type varchar(50) using ("method"::varchar(50));`);
    this.addSql(`alter table "payments" alter column "status" type varchar(50) using ("status"::varchar(50));`);
    this.addSql(`alter table "payments" alter column "status" set default 'PENDING';`);
    this.addSql(`alter table "payments" alter column "notes" type text using ("notes"::text);`);
    this.addSql(`alter table "payments" add constraint "payments_lease_id_fkey" foreign key ("lease_id") references "leases" ("id") on update no action on delete no action;`);
    this.addSql(`create index "idx_payments_lease" on "payments" ("lease_id");`);
    this.addSql(`create index "idx_payments_tenant" on "payments" ("tenant_id");`);

    this.addSql(`alter table "properties" alter column "id" drop default;`);
    this.addSql(`alter table "properties" alter column "id" type uuid using ("id"::text::uuid);`);
    this.addSql(`alter table "properties" alter column "id" set default gen_random_uuid();`);
    this.addSql(`alter table "properties" alter column "created_at" type timestamp(6) using ("created_at"::timestamp(6));`);
    this.addSql(`alter table "properties" alter column "created_at" set default now();`);
    this.addSql(`alter table "properties" alter column "updated_at" type timestamp(6) using ("updated_at"::timestamp(6));`);
    this.addSql(`alter table "properties" alter column "updated_at" set default now();`);
    this.addSql(`alter table "properties" alter column "address" type text using ("address"::text);`);
    this.addSql(`alter table "properties" add constraint "properties_tenant_id_fkey" foreign key ("tenant_id") references "tenants" ("id") on update no action on delete cascade;`);
    this.addSql(`create index "idx_properties_tenant" on "properties" ("tenant_id");`);

    this.addSql(`alter table "rent_increases" alter column "id" drop default;`);
    this.addSql(`alter table "rent_increases" alter column "id" type uuid using ("id"::text::uuid);`);
    this.addSql(`alter table "rent_increases" alter column "id" set default gen_random_uuid();`);
    this.addSql(`alter table "rent_increases" alter column "created_at" type timestamp(6) using ("created_at"::timestamp(6));`);
    this.addSql(`alter table "rent_increases" alter column "created_at" set default now();`);
    this.addSql(`alter table "rent_increases" alter column "updated_at" type timestamp(6) using ("updated_at"::timestamp(6));`);
    this.addSql(`alter table "rent_increases" alter column "updated_at" set default now();`);
    this.addSql(`alter table "rent_increases" alter column "old_rent" type numeric(15,2) using ("old_rent"::numeric(15,2));`);
    this.addSql(`alter table "rent_increases" alter column "new_rent" type numeric(15,2) using ("new_rent"::numeric(15,2));`);
    this.addSql(`alter table "rent_increases" alter column "increase_percentage" type numeric(5,2) using ("increase_percentage"::numeric(5,2));`);
    this.addSql(`alter table "rent_increases" add constraint "rent_increases_lease_id_fkey" foreign key ("lease_id") references "leases" ("id") on update no action on delete cascade;`);
    this.addSql(`create index "idx_rent_increases_lease" on "rent_increases" ("lease_id");`);
    this.addSql(`create index "idx_rent_increases_tenant" on "rent_increases" ("tenant_id");`);

    this.addSql(`alter table "renters" alter column "id" drop default;`);
    this.addSql(`alter table "renters" alter column "id" type uuid using ("id"::text::uuid);`);
    this.addSql(`alter table "renters" alter column "id" set default gen_random_uuid();`);
    this.addSql(`alter table "renters" alter column "created_at" type timestamp(6) using ("created_at"::timestamp(6));`);
    this.addSql(`alter table "renters" alter column "created_at" set default now();`);
    this.addSql(`alter table "renters" alter column "updated_at" type timestamp(6) using ("updated_at"::timestamp(6));`);
    this.addSql(`alter table "renters" alter column "updated_at" set default now();`);
    this.addSql(`alter table "renters" alter column "phone" type varchar(50) using ("phone"::varchar(50));`);
    this.addSql(`alter table "renters" alter column "identification" type varchar(100) using ("identification"::varchar(100));`);
    this.addSql(`create index "idx_renters_tenant" on "renters" ("tenant_id");`);

    this.addSql(`alter table "tenant_users" alter column "id" drop default;`);
    this.addSql(`alter table "tenant_users" alter column "id" type uuid using ("id"::text::uuid);`);
    this.addSql(`alter table "tenant_users" alter column "id" set default gen_random_uuid();`);
    this.addSql(`alter table "tenant_users" alter column "created_at" type timestamp(6) using ("created_at"::timestamp(6));`);
    this.addSql(`alter table "tenant_users" alter column "created_at" set default now();`);
    this.addSql(`alter table "tenant_users" alter column "updated_at" type timestamp(6) using ("updated_at"::timestamp(6));`);
    this.addSql(`alter table "tenant_users" alter column "updated_at" set default now();`);
    this.addSql(`alter table "tenant_users" alter column "role" type varchar(50) using ("role"::varchar(50));`);
    this.addSql(`alter table "tenant_users" add constraint "tenant_users_tenant_id_fkey" foreign key ("tenant_id") references "tenants" ("id") on update no action on delete cascade;`);
    this.addSql(`alter table "tenant_users" add constraint "tenant_users_user_id_fkey" foreign key ("user_id") references "users" ("id") on update no action on delete cascade;`);
    this.addSql(`create index "idx_tenant_users_tenant" on "tenant_users" ("tenant_id");`);
    this.addSql(`create index "idx_tenant_users_user" on "tenant_users" ("user_id");`);
    this.addSql(`alter table "tenant_users" add constraint "tenant_users_tenant_id_user_id_key" unique ("tenant_id", "user_id");`);

    this.addSql(`alter table "tenants" alter column "id" drop default;`);
    this.addSql(`alter table "tenants" alter column "id" type uuid using ("id"::text::uuid);`);
    this.addSql(`alter table "tenants" alter column "id" set default gen_random_uuid();`);
    this.addSql(`alter table "tenants" alter column "created_at" type timestamp(6) using ("created_at"::timestamp(6));`);
    this.addSql(`alter table "tenants" alter column "created_at" set default now();`);
    this.addSql(`alter table "tenants" alter column "updated_at" type timestamp(6) using ("updated_at"::timestamp(6));`);
    this.addSql(`alter table "tenants" alter column "updated_at" set default now();`);
    this.addSql(`alter table "tenants" alter column "slug" type varchar(255) using ("slug"::varchar(255));`);
    this.addSql(`alter table "tenants" alter column "slug" drop not null;`);
    this.addSql(`alter table "tenants" alter column "status" type varchar(50) using ("status"::varchar(50));`);
    this.addSql(`alter table "tenants" alter column "plan" type varchar(50) using ("plan"::varchar(50));`);
    this.addSql(`alter table "tenants" alter column "plan" set default 'FREE';`);
    this.addSql(`alter table "tenants" alter column "plan" set not null;`);
    this.addSql(`create index "idx_tenants_slug" on "tenants" ("slug");`);
    this.addSql(`alter table "tenants" drop constraint "tenants_slug_unique";`);
    this.addSql(`alter table "tenants" add constraint "tenants_slug_key" unique ("slug");`);

    this.addSql(`alter table "units" alter column "id" drop default;`);
    this.addSql(`alter table "units" alter column "id" type uuid using ("id"::text::uuid);`);
    this.addSql(`alter table "units" alter column "id" set default gen_random_uuid();`);
    this.addSql(`alter table "units" alter column "created_at" type timestamp(6) using ("created_at"::timestamp(6));`);
    this.addSql(`alter table "units" alter column "created_at" set default now();`);
    this.addSql(`alter table "units" alter column "updated_at" type timestamp(6) using ("updated_at"::timestamp(6));`);
    this.addSql(`alter table "units" alter column "updated_at" set default now();`);
    this.addSql(`alter table "units" alter column "type" type varchar(100) using ("type"::varchar(100));`);
    this.addSql(`alter table "units" alter column "area" type numeric(10,2) using ("area"::numeric(10,2));`);
    this.addSql(`alter table "units" alter column "bathrooms" type numeric(3,1) using ("bathrooms"::numeric(3,1));`);
    this.addSql(`alter table "units" alter column "status" type varchar(50) using ("status"::varchar(50));`);
    this.addSql(`alter table "units" alter column "base_rent" type numeric(15,2) using ("base_rent"::numeric(15,2));`);
    this.addSql(`alter table "units" add constraint "units_property_id_fkey" foreign key ("property_id") references "properties" ("id") on update no action on delete cascade;`);
    this.addSql(`create index "idx_units_property" on "units" ("property_id");`);
    this.addSql(`create index "idx_units_tenant" on "units" ("tenant_id");`);

    this.addSql(`alter table "users" alter column "id" drop default;`);
    this.addSql(`alter table "users" alter column "id" type uuid using ("id"::text::uuid);`);
    this.addSql(`alter table "users" alter column "id" set default gen_random_uuid();`);
    this.addSql(`alter table "users" alter column "created_at" type timestamp(6) using ("created_at"::timestamp(6));`);
    this.addSql(`alter table "users" alter column "created_at" set default now();`);
    this.addSql(`alter table "users" alter column "updated_at" type timestamp(6) using ("updated_at"::timestamp(6));`);
    this.addSql(`alter table "users" alter column "updated_at" set default now();`);
    this.addSql(`alter table "users" alter column "global_role" type varchar(50) using ("global_role"::varchar(50));`);
    this.addSql(`create index "idx_users_email" on "users" ("email");`);
    this.addSql(`create index "idx_users_global_role" on "users" ("global_role");`);
    this.addSql(`alter table "users" drop constraint "users_email_unique";`);
    this.addSql(`alter table "users" add constraint "users_email_key" unique ("email");`);
  }

}
