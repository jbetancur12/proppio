-- Rollback: Disable Row Level Security
-- Use this if RLS causes issues in production
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE units DISABLE ROW LEVEL SECURITY;
ALTER TABLE renters DISABLE ROW LEVEL SECURITY;
ALTER TABLE leases DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tickets DISABLE ROW LEVEL SECURITY;
-- Drop all policies
DROP POLICY IF EXISTS tenant_isolation_policy ON properties;
DROP POLICY IF EXISTS tenant_isolation_policy ON units;
DROP POLICY IF EXISTS tenant_isolation_policy ON renters;
DROP POLICY IF EXISTS tenant_isolation_policy ON leases;
DROP POLICY IF EXISTS tenant_isolation_policy ON payments;
DROP POLICY IF EXISTS tenant_isolation_policy ON expenses;
DROP POLICY IF EXISTS tenant_isolation_policy ON maintenance_tickets;
DROP POLICY IF EXISTS bypass_rls_for_seeds ON properties;
DROP POLICY IF EXISTS bypass_rls_for_seeds ON units;
DROP POLICY IF EXISTS bypass_rls_for_seeds ON renters;
DROP POLICY IF EXISTS bypass_rls_for_seeds ON leases;
DROP POLICY IF EXISTS bypass_rls_for_seeds ON payments;
DROP POLICY IF EXISTS bypass_rls_for_seeds ON expenses;
DROP POLICY IF EXISTS bypass_rls_for_seeds ON maintenance_tickets;