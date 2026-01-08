import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuditLogs } from './hooks/useAdmin';
import { Download, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function AuditLogsPage() {
    const [filters, setFilters] = useState({
        action: '',
        startDate: '',
        endDate: '',
        limit: 50,
        offset: 0
    });

    const { data, isLoading } = useAuditLogs(filters);

    const handleExport = () => {
        // TODO: Implement CSV export
        console.log('Exporting logs...');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
                    <p className="text-gray-600">Registro de actividades del sistema</p>
                </div>
                <Button variant="outline" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar CSV
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Input
                            placeholder="Buscar por acción..."
                            value={filters.action}
                            onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                        />
                        <Input
                            type="date"
                            placeholder="Fecha inicio"
                            value={filters.startDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                        <Input
                            type="date"
                            placeholder="Fecha fin"
                            value={filters.endDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Logs Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Historial de Actividad ({data?.count || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Fecha</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Usuario</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tenant</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Acción</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Recurso</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Detalles</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {data?.logs?.map((log: any) => (
                                        <tr key={log.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {format(new Date(log.createdAt), 'PP pp', { locale: es })}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <div className="font-medium text-gray-900">{log.user?.firstName} {log.user?.lastName}</div>
                                                <div className="text-xs text-gray-500">{log.user?.email}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {log.tenant ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                        {log.tenant.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">Global</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {log.resourceType && (
                                                    <div>
                                                        <span className="font-medium">{log.resourceType}</span>
                                                        <span className="text-xs text-gray-400 ml-1">#{log.resourceId?.substring(0, 8)}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                                                {JSON.stringify(log.details)}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!data?.logs || data.logs.length === 0) && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                                No hay registros que coincidan con los filtros
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
