import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { memo } from 'react';

interface FinancialChartProps {
    data?: { month: string; income: number; expense: number }[];
}

export const FinancialChart = memo(function FinancialChart({ data }: FinancialChartProps) {
    if (!data || data.length === 0) return null;

    return (
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium text-gray-900">Ingresos vs Gastos</CardTitle>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-indigo-500 rounded-sm"></div>
                        <span>Ingresos</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-rose-500 rounded-sm"></div>
                        <span>Gastos</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                dy={10}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                tickFormatter={(value) => `$${value / 1000}k`}
                            />
                            <Tooltip
                                cursor={{ fill: '#f9fafb' }}
                                contentStyle={{
                                    borderRadius: '0.5rem',
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                }}
                                formatter={(value: number) => [`$${Number(value).toLocaleString()}`, '']}
                            />
                            <Bar dataKey="income" name="Ingresos" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                            <Bar dataKey="expense" name="Gastos" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
});
