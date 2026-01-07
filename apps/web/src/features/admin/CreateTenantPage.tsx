import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateTenant } from './hooks/useAdmin';
import { ArrowLeft } from 'lucide-react';

export function CreateTenantPage() {
    const navigate = useNavigate();
    const createTenant = useCreateTenant();

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        plan: 'FREE',
        adminEmail: '',
        adminPassword: '',
        adminFirstName: '',
        adminLastName: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        createTenant.mutate(
            {
                name: formData.name,
                slug: formData.slug,
                plan: formData.plan,
                adminUser: {
                    email: formData.adminEmail,
                    password: formData.adminPassword,
                    firstName: formData.adminFirstName,
                    lastName: formData.adminLastName
                }
            },
            {
                onSuccess: () => {
                    navigate('/admin/tenants');
                }
            }
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => navigate('/admin/tenants')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Tenant</h1>
                    <p className="text-gray-600">Configura un nuevo cliente en el sistema</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Información del Tenant</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Nombre del Tenant *</Label>
                            <Input
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ej: Acme Corporation"
                            />
                        </div>

                        <div>
                            <Label>Slug (URL) *</Label>
                            <Input
                                required
                                value={formData.slug}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        slug: e.target.value.toLowerCase().replace(/\s+/g, '-')
                                    })
                                }
                                placeholder="ej: acme-corp"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                URL amigable, solo minúsculas y guiones
                            </p>
                        </div>

                        <div>
                            <Label>Plan</Label>
                            <select
                                value={formData.plan}
                                onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="FREE">FREE</option>
                                <option value="PRO">PRO</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Usuario Administrador</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Nombre *</Label>
                                <Input
                                    required
                                    value={formData.adminFirstName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, adminFirstName: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <Label>Apellido *</Label>
                                <Input
                                    required
                                    value={formData.adminLastName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, adminLastName: e.target.value })
                                    }
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Email *</Label>
                            <Input
                                type="email"
                                required
                                value={formData.adminEmail}
                                onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                                placeholder="admin@acme.com"
                            />
                        </div>

                        <div>
                            <Label>Contraseña *</Label>
                            <Input
                                type="password"
                                required
                                minLength={8}
                                value={formData.adminPassword}
                                onChange={(e) =>
                                    setFormData({ ...formData, adminPassword: e.target.value })
                                }
                                placeholder="Mínimo 8 caracteres"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-4">
                    <Button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700"
                        disabled={createTenant.isPending}
                    >
                        {createTenant.isPending ? 'Creando...' : 'Crear Tenant'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/admin/tenants')}
                    >
                        Cancelar
                    </Button>
                </div>
            </form>
        </div>
    );
}
