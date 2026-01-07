import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { useGlobalMetrics, useAllTenants } from './hooks/useAdmin';
import { Tenant } from './services/adminApi';

export function AdminDashboardPage() {
    const { data: metrics, isLoading: metricsLoading } = useGlobalMetrics();
    const { data: tenants = [], isLoading: tenantsLoading } = useAllTenants();

    const recentTenants = tenants.slice(0, 5);

    const formatDate = (date: string) => new Date(date).toLocaleDateString('es-CO');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Visión general del sistema</p>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Total Tenants
                        </CardTitle>
                        <Building2 className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {metricsLoading ? '...' : metrics?.totalTenants || 0}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Activos
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {metricsLoading ? '...' : metrics?.activeTenants || 0}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Suspendidos
                        </CardTitle>
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">
                            {metricsLoading ? '...' : metrics?.suspendedTenants || 0}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Total Users
                        </CardTitle>
                        <Users className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {metricsLoading ? '...' : metrics?.totalUsers || 0}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Tenants */}
            <Card>
                <CardHeader>
                    <CardTitle>Tenants Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                    {tenantsLoading ? (
                        <p className="text-gray-500">Cargando...</p>
                    ) : (
                        <div className="space-y-3">
                            {recentTenants.map((tenant: Tenant) => (
                                <div
                                    key={tenant.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div>
                                        <p className="font-medium">{tenant.name}</p>
                                        <p className="text-sm text-gray-500">/{tenant.slug}</p>
                                    </div>
                                    <div className="text-right">
                                        <span
                                            className={`inline-block px-2 py-1 text-xs rounded-full ${tenant.status === 'ACTIVE'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-amber-100 text-amber-700'
                                                }`}
                                        >
                                            {tenant.status}
                                        </span>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formatDate(tenant.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
