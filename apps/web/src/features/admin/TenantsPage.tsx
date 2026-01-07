import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAllTenants, useUpdateTenantStatus } from '../hooks/useAdmin';
import { Tenant } from '../services/adminApi';
import { Eye, Power, PowerOff, Plus } from 'lucide-react';

export function TenantsPage() {
    const { data: tenants = [], isLoading } = useAllTenants();
    const updateStatus = useUpdateTenantStatus();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');

    const filteredTenants = tenants.filter((tenant: Tenant) => {
        const matchesSearch =
            tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tenant.slug.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || tenant.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleToggleStatus = (id: string, currentStatus: 'ACTIVE' | 'SUSPENDED') => {
        const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        const action = newStatus === 'ACTIVE' ? 'activar' : 'suspender';

        if (confirm(`¿Estás seguro de ${action} este tenant?`)) {
            updateStatus.mutate({ id, status: newStatus });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Tenants</h1>
                    <p className="text-gray-600">Gestionar todos los tenants del sistema</p>
                </div>
                <Link to="/admin/tenants/create">
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Tenant
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex gap-4">
                        <Input
                            placeholder="Buscar por nombre o slug..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="px-4 py-2 border border-gray-300 rounded-md"
                        >
                            <option value="ALL">Todos</option>
                            <option value="ACTIVE">Activos</option>
                            <option value="SUSPENDED">Suspendidos</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Tenants Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Tenants ({filteredTenants.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <p className="text-gray-500">Cargando...</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                            Nombre
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                            Slug
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                            Plan
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                            Estado
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                            Creado
                                        </th>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredTenants.map((tenant: Tenant) => (
                                        <tr key={tenant.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm font-medium">{tenant.name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">/{tenant.slug}</td>
                                            <td className="px-4 py-3 text-sm">{tenant.plan || 'FREE'}</td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-block px-2 py-1 text-xs rounded-full ${tenant.status === 'ACTIVE'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-amber-100 text-amber-700'
                                                        }`}
                                                >
                                                    {tenant.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {new Date(tenant.createdAt).toLocaleDateString('es-CO')}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <Link to={`/admin/tenants/${tenant.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleToggleStatus(tenant.id, tenant.status)}
                                                        disabled={updateStatus.isPending}
                                                    >
                                                        {tenant.status === 'ACTIVE' ? (
                                                            <PowerOff className="h-4 w-4 text-amber-600" />
                                                        ) : (
                                                            <Power className="h-4 w-4 text-green-600" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
