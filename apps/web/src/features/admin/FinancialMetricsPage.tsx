import { useQuery } from '@tanstack/react-query';
import { adminApi } from './services/adminApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, DollarSign, TrendingUp, CreditCard, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function FinancialMetricsPage() {
    const { data: metrics, isLoading } = useQuery({
        queryKey: ['financial-metrics'],
        queryFn: () => adminApi.getFinancialMetrics()
    });

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(value);
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Métricas Financieras</h1>
                <p className="text-gray-600">Resumen de ingresos y rendimiento del sistema</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            MRR (Monthly Recurring Revenue)
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                            {formatCurrency(metrics?.mrr || 0)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Basado en planes activos
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            ARR (Annual Run Rate)
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                            {formatCurrency(metrics?.arr || 0)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Proyección anual (MRR x 12)
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Tasa de Éxito de Pagos
                        </CardTitle>
                        <CreditCard className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                            {metrics?.successRate || 0}%
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Pagos completados vs Total
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Ingresos por Tenant (Top 10)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={(metrics?.revenueByTenant || []).slice(0, 10)}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="tenantName"
                                    type="category"
                                    width={150}
                                    tick={{ fontSize: 12 }}
                                />
                                <Tooltip
                                    formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Ingresos']}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Bar dataKey="amount" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Detalle de Planes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Placeholder for Plan Distribution if needed */}
                        <div className="space-y-4">
                            {(metrics?.revenueByTenant || []).slice(0, 5).map((t: any, i: number) => (
                                <div key={t.tenantId} className="flex items-center justify-between border-b pb-2 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{t.tenantName}</p>
                                        </div>
                                    </div>
                                    <span className="font-semibold text-gray-900 text-sm">
                                        {formatCurrency(t.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
