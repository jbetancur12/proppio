import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function UsersPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Users</h1>
                <p className="text-gray-600">Gestión global de usuarios</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Usuarios del Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-500">Lista de usuarios - Próximamente</p>
                </CardContent>
            </Card>
        </div>
    );
}
