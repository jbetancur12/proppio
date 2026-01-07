import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTenant } from '../hooks/useAdmin';
import { ImpersonateButton } from '../components/ImpersonateButton';
import { ArrowLeft, Building2, FileText, Users } from 'lucide-react';

export function TenantDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data, isLoading } = useTenant(id!);

    if (isLoading) {
        return <div className="p-8">Cargando...</div>;
    }

    if (!data) {
        return <div className="p-8">Tenant no encontrado</div>;
    }

    const { tenant, stats } = data;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => navigate('/admin/tenants')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{tenant.name}</h1>
                    <p className="text-gray-600">/{tenant.slug}</p>
                </div>
            </div>

            {/* Tenant Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Información del Tenant</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Estado</p>
                            <span
                                className={`inline-block px-3 py-1 text-sm rounded-full mt-1 ${tenant.status === 'ACTIVE'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-amber-100 text-amber-700'
                                    }`}
                            >
                                {tenant.status}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Plan</p>
                            <p className="font-medium">{tenant.plan || 'FREE'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Creado</p>
                            <p className="font-medium">
                                {new Date(tenant.createdAt).toLocaleDateString('es-CO')}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">ID</p>
                            <p className="font-mono text-xs">{tenant.id}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Propiedades</CardTitle>
                        <Building2 className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.propertiesCount}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Contratos</CardTitle>
                        <FileText className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.leasesCount}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
                        <Users className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.usersCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Acciones</CardTitle>
                </CardHeader>
                <CardContent>
                    <ImpersonateButton tenantId={tenant.id} tenantName={tenant.name} />
                </CardContent>
            </Card>
        </div>
    );
}
