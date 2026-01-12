import { ReactNode, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { LoadingSpinner } from './components/LoadingSpinner';
import { SubscriptionSuspendedPage } from './pages/SubscriptionSuspendedPage';
import { AdminLayout } from './features/admin/components/AdminLayout';
import { RequireSuperAdmin } from './features/admin/components/RequireSuperAdmin';

// Lazy-loaded pages for code splitting
const DashboardPage = lazy(() =>
    import('./features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const PropertiesPage = lazy(() =>
    import('./features/properties/PropertiesPage').then((m) => ({ default: m.PropertiesPage })),
);
const PropertyDetailPage = lazy(() =>
    import('./features/properties/PropertyDetailPage').then((m) => ({ default: m.PropertyDetailPage })),
);
const RentersPage = lazy(() => import('./features/renters/RentersPage').then((m) => ({ default: m.RentersPage })));
const RenterDetailPage = lazy(() =>
    import('./features/renters/RenterDetailPage').then((m) => ({ default: m.RenterDetailPage })),
);
const LeasesPage = lazy(() => import('./features/leases/LeasesPage').then((m) => ({ default: m.LeasesPage })));
const LeaseDetailPage = lazy(() =>
    import('./features/leases/LeaseDetailPage').then((m) => ({ default: m.LeaseDetailPage })),
);
const RentIncreasePage = lazy(() =>
    import('./features/leases/RentIncreasePage').then((m) => ({ default: m.RentIncreasePage })),
);
const PaymentsPage = lazy(() => import('./features/payments/PaymentsPage').then((m) => ({ default: m.PaymentsPage })));
const ExpensesPage = lazy(() => import('./features/expenses/ExpensesPage').then((m) => ({ default: m.ExpensesPage })));
const MaintenancePage = lazy(() =>
    import('./features/maintenance/MaintenancePage').then((m) => ({ default: m.MaintenancePage })),
);
const TreasuryPage = lazy(() => import('./features/treasury/TreasuryPage').then((m) => ({ default: m.TreasuryPage })));
const SettingsPage = lazy(() => import('./features/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const AdminDashboardPage = lazy(() =>
    import('./features/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })),
);
const TenantsPage = lazy(() => import('./features/admin/TenantsPage').then((m) => ({ default: m.TenantsPage })));
const CreateTenantPage = lazy(() =>
    import('./features/admin/CreateTenantPage').then((m) => ({ default: m.CreateTenantPage })),
);
const TenantDetailPage = lazy(() =>
    import('./features/admin/TenantDetailPage').then((m) => ({ default: m.TenantDetailPage })),
);
const UsersPage = lazy(() => import('./features/admin/UsersPage').then((m) => ({ default: m.UsersPage })));
const AuditLogsPage = lazy(() => import('./features/admin/AuditLogsPage').then((m) => ({ default: m.AuditLogsPage })));
const FinancialMetricsPage = lazy(() =>
    import('./features/admin/FinancialMetricsPage').then((m) => ({ default: m.FinancialMetricsPage })),
);

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: ReactNode }) {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) return <Navigate to="/login" />;

    // Block Super Admin from accessing regular dashboard unless impersonating
    if (user?.globalRole === 'SUPER_ADMIN' && !localStorage.getItem('isImpersonating')) {
        return <Navigate to="/admin" />;
    }

    return (
        <DashboardLayout>
            <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
        </DashboardLayout>
    );
}

import { ErrorBoundary } from './components/ui/ErrorBoundary';

function App() {
    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/" element={<Navigate to="/dashboard" />} />
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <DashboardPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/properties"
                                element={
                                    <ProtectedRoute>
                                        <PropertiesPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/properties/:id"
                                element={
                                    <ProtectedRoute>
                                        <PropertyDetailPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/renters"
                                element={
                                    <ProtectedRoute>
                                        <RentersPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/renters/:id"
                                element={
                                    <ProtectedRoute>
                                        <RenterDetailPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/leases"
                                element={
                                    <ProtectedRoute>
                                        <LeasesPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/leases/:id"
                                element={
                                    <ProtectedRoute>
                                        <LeaseDetailPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/payments"
                                element={
                                    <ProtectedRoute>
                                        <PaymentsPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/expenses"
                                element={
                                    <ProtectedRoute>
                                        <ExpensesPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/maintenance"
                                element={
                                    <ProtectedRoute>
                                        <MaintenancePage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/rent-increases"
                                element={
                                    <ProtectedRoute>
                                        <RentIncreasePage />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/treasury"
                                element={
                                    <ProtectedRoute>
                                        <TreasuryPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/settings"
                                element={
                                    <ProtectedRoute>
                                        <SettingsPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="/subscription-suspended" element={<SubscriptionSuspendedPage />} />

                            {/* Admin Routes */}
                            <Route
                                path="/admin"
                                element={
                                    <RequireSuperAdmin>
                                        <AdminLayout>
                                            <Suspense fallback={<LoadingSpinner />}>
                                                <AdminDashboardPage />
                                            </Suspense>
                                        </AdminLayout>
                                    </RequireSuperAdmin>
                                }
                            />
                            <Route
                                path="/admin/tenants"
                                element={
                                    <RequireSuperAdmin>
                                        <AdminLayout>
                                            <Suspense fallback={<LoadingSpinner />}>
                                                <TenantsPage />
                                            </Suspense>
                                        </AdminLayout>
                                    </RequireSuperAdmin>
                                }
                            />
                            <Route
                                path="/admin/tenants/create"
                                element={
                                    <RequireSuperAdmin>
                                        <AdminLayout>
                                            <Suspense fallback={<LoadingSpinner />}>
                                                <CreateTenantPage />
                                            </Suspense>
                                        </AdminLayout>
                                    </RequireSuperAdmin>
                                }
                            />
                            <Route
                                path="/admin/tenants/:id"
                                element={
                                    <RequireSuperAdmin>
                                        <AdminLayout>
                                            <Suspense fallback={<LoadingSpinner />}>
                                                <TenantDetailPage />
                                            </Suspense>
                                        </AdminLayout>
                                    </RequireSuperAdmin>
                                }
                            />
                            <Route
                                path="/admin/users"
                                element={
                                    <RequireSuperAdmin>
                                        <AdminLayout>
                                            <Suspense fallback={<LoadingSpinner />}>
                                                <UsersPage />
                                            </Suspense>
                                        </AdminLayout>
                                    </RequireSuperAdmin>
                                }
                            />
                            <Route
                                path="/admin/audit-logs"
                                element={
                                    <RequireSuperAdmin>
                                        <AdminLayout>
                                            <Suspense fallback={<LoadingSpinner />}>
                                                <AuditLogsPage />
                                            </Suspense>
                                        </AdminLayout>
                                    </RequireSuperAdmin>
                                }
                            />
                            <Route
                                path="/admin/financial-metrics"
                                element={
                                    <RequireSuperAdmin>
                                        <AdminLayout>
                                            <Suspense fallback={<LoadingSpinner />}>
                                                <FinancialMetricsPage />
                                            </Suspense>
                                        </AdminLayout>
                                    </RequireSuperAdmin>
                                }
                            />

                            <Route path="*" element={<Navigate to="/dashboard" />} />
                        </Routes>
                        <Toaster position="top-center" />
                    </BrowserRouter>
                </AuthProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    );
}

export default App;
