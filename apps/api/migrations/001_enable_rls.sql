-- Migration: Enable Row Level Security (RLS)
-- Purpose: Implement Capa 3 of Multi-tenancy defense
-- Date: 2026-01-07
-- ========================================
-- STEP 1: Enable RLS on all tenant tables
-- ========================================
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE renters ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tickets ENABLE ROW LEVEL SECURITY;
-- ========================================
-- STEP 2: Create isolation policies
-- ========================================
-- Properties
CREATE POLICY tenant_isolation_policy ON properties FOR ALL USING (
    tenant_id = current_setting('app.current_tenant', true)::uuid
) WITH CHECK (
    tenant_id = current_setting('app.current_tenant', true)::uuid
);
-- Units
CREATE POLICY tenant_isolation_policy ON units FOR ALL USING (
    tenant_id = current_setting('app.current_tenant', true)::uuid
) WITH CHECK (
    tenant_id = current_setting('app.current_tenant', true)::uuid
);
-- Renters
CREATE POLICY tenant_isolation_policy ON renters FOR ALL USING (
    tenant_id = current_setting('app.current_tenant', true)::uuid
) WITH CHECK (
    tenant_id = current_setting('app.current_tenant', true)::uuid
);
-- Leases
CREATE POLICY tenant_isolation_policy ON leases FOR ALL USING (
    tenant_id = current_setting('app.current_tenant', true)::uuid
) WITH CHECK (
    tenant_id = current_setting('app.current_tenant', true)::uuid
);
-- Payments
CREATE POLICY tenant_isolation_policy ON payments FOR ALL USING (
    tenant_id = current_setting('app.current_tenant', true)::uuid
) WITH CHECK (
    tenant_id = current_setting('app.current_tenant', true)::uuid
);
-- Expenses
CREATE POLICY tenant_isolation_policy ON expenses FOR ALL USING (
    tenant_id = current_setting('app.current_tenant', true)::uuid
) WITH CHECK (
    tenant_id = current_setting('app.current_tenant', true)::uuid
);
-- Maintenance Tickets
CREATE POLICY tenant_isolation_policy ON maintenance_tickets FOR ALL USING (
    tenant_id = current_setting('app.current_tenant', true)::uuid
) WITH CHECK (
    tenant_id = current_setting('app.current_tenant', true)::uuid
);
-- ========================================
-- STEP 3: Create bypass policy for seeds/migrations
-- ========================================
-- This allows non-tenant operations ONLY when session_replication_role is 'replica'
-- Used for seeds and migrations
CREATE POLICY bypass_rls_for_seeds ON properties USING (
    current_setting('session_replication_role') = 'replica'
);
CREATE POLICY bypass_rls_for_seeds ON units USING (
    current_setting('session_replication_role') = 'replica'
);
CREATE POLICY bypass_rls_for_seeds ON renters USING (
    current_setting('session_replication_role') = 'replica'
);
CREATE POLICY bypass_rls_for_seeds ON leases USING (
    current_setting('session_replication_role') = 'replica'
);
CREATE POLICY bypass_rls_for_seeds ON payments USING (
    current_setting('session_replication_role') = 'replica'
);
CREATE POLICY bypass_rls_for_seeds ON expenses USING (
    current_setting('session_replication_role') = 'replica'
);
CREATE POLICY bypass_rls_for_seeds ON maintenance_tickets USING (
    current_setting('session_replication_role') = 'replica'
);
-- ========================================
-- NOTES
-- ========================================
-- 1. current_setting('app.current_tenant', true) returns NULL if not set (safe default)
-- 2. All queries without SET app.current_tenant will see 0 rows
-- 3. To disable RLS temporarily: SET session_replication_role = 'replica';
-- 4. To rollback: See rollback_rls.sql