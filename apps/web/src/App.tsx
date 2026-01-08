import { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Feature-based imports (following design_guidelines.md 3.3 Co-location)
import { DashboardPage } from './features/dashboard/DashboardPage';
import { PropertiesPage } from './features/properties/PropertiesPage';
import { PropertyDetailPage } from './features/properties/PropertyDetailPage';
import { RentersPage } from './features/renters/RentersPage';
import { LeasesPage } from './features/leases/LeasesPage';
import { RenterDetailPage } from './features/renters/RenterDetailPage';
import { LeaseDetailPage } from './features/leases/LeaseDetailPage';
import { PaymentsPage } from './features/payments/PaymentsPage';
import { ExpensesPage } from './features/expenses/ExpensesPage';
import { MaintenancePage } from './features/maintenance/MaintenancePage';
import { SubscriptionSuspendedPage } from './pages/SubscriptionSuspendedPage';
import { RentIncreasePage } from './features/leases/RentIncreasePage';
import { AdminLayout } from './features/admin/components/AdminLayout';
import { AdminDashboardPage } from './features/admin/AdminDashboardPage';
import { TenantsPage } from './features/admin/TenantsPage';
import { CreateTenantPage } from './features/admin/CreateTenantPage';
import { TenantDetailPage } from './features/admin/TenantDetailPage';
import { UsersPage } from './features/admin/UsersPage';
import { AuditLogsPage } from './features/admin/AuditLogsPage';
import { FinancialMetricsPage } from './features/admin/FinancialMetricsPage';
import { RequireSuperAdmin } from './features/admin/components/RequireSuperAdmin';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" />;

  // Block Super Admin from accessing regular dashboard unless impersonating
  // (Impersonation logic usually adds something to indicate it, but here we can check if they lack tenantId)
  if (user?.globalRole === 'SUPER_ADMIN' && !localStorage.getItem('isImpersonating')) {
    return <Navigate to="/admin" />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/properties" element={
              <ProtectedRoute>
                <PropertiesPage />
              </ProtectedRoute>
            } />
            <Route path="/properties/:id" element={
              <ProtectedRoute>
                <PropertyDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/renters" element={
              <ProtectedRoute>
                <RentersPage />
              </ProtectedRoute>
            } />
            <Route path="/renters/:id" element={
              <ProtectedRoute>
                <RenterDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/leases" element={
              <ProtectedRoute>
                <LeasesPage />
              </ProtectedRoute>
            } />
            <Route path="/leases/:id" element={
              <ProtectedRoute>
                <LeaseDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/payments" element={
              <ProtectedRoute>
                <PaymentsPage />
              </ProtectedRoute>
            } />
            <Route path="/expenses" element={
              <ProtectedRoute>
                <ExpensesPage />
              </ProtectedRoute>
            } />
            <Route path="/maintenance" element={
              <ProtectedRoute>
                <MaintenancePage />
              </ProtectedRoute>
            } />
            <Route path="/rent-increases" element={
              <ProtectedRoute>
                <RentIncreasePage />
              </ProtectedRoute>
            } />
            <Route path="/subscription-suspended" element={<SubscriptionSuspendedPage />} />

            {/* Admin Routes */}
            {/* Admin Routes */}
            <Route path="/admin" element={
              <RequireSuperAdmin>
                <AdminLayout><AdminDashboardPage /></AdminLayout>
              </RequireSuperAdmin>
            } />
            <Route path="/admin/tenants" element={
              <RequireSuperAdmin>
                <AdminLayout><TenantsPage /></AdminLayout>
              </RequireSuperAdmin>
            } />
            <Route path="/admin/tenants/create" element={
              <RequireSuperAdmin>
                <AdminLayout><CreateTenantPage /></AdminLayout>
              </RequireSuperAdmin>
            } />
            <Route path="/admin/tenants/:id" element={
              <RequireSuperAdmin>
                <AdminLayout><TenantDetailPage /></AdminLayout>
              </RequireSuperAdmin>
            } />
            <Route path="/admin/users" element={
              <RequireSuperAdmin>
                <AdminLayout><UsersPage /></AdminLayout>
              </RequireSuperAdmin>
            } />
            <Route path="/admin/audit-logs" element={
              <RequireSuperAdmin>
                <AdminLayout><AuditLogsPage /></AdminLayout>
              </RequireSuperAdmin>
            } />
            <Route path="/admin/financial-metrics" element={
              <RequireSuperAdmin>
                <AdminLayout><FinancialMetricsPage /></AdminLayout>
              </RequireSuperAdmin>
            } />

            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
