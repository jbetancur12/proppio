import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { treasuryApi, GlobalBalance, UnifiedTransaction } from './services/treasuryApi';
import { TransactionModal } from './components/TransactionModal';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowUpRight, ArrowDownLeft, Wallet, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { addDays, addMonths, format, startOfDay, endOfDay, startOfMonth, endOfMonth, isSameDay, isSameMonth } from 'date-fns';
import { es } from 'date-fns/locale';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type ViewMode = 'DAILY' | 'MONTHLY';

export function TreasuryPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // State
    const [balance, setBalance] = useState<GlobalBalance | null>(null);
    const [transactions, setTransactions] = useState<UnifiedTransaction[]>([]);
    const [meta, setMeta] = useState<{ total: number; page: number; limit: number }>({ total: 0, page: 1, limit: 20 });

    // Filters
    const [viewMode, setViewMode] = useState<ViewMode>('DAILY');
    const [currentDate, setCurrentDate] = useState(new Date());

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Feature Flag Guard
    useEffect(() => {
        if (!user?.features?.treasury) {
            toast.error('Módulo no habilitado para su plan');
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Calculate ranges based on ViewMode
            let startDate: Date, endDate: Date;

            if (viewMode === 'DAILY') {
                startDate = startOfDay(currentDate);
                endDate = endOfDay(currentDate);
            } else {
                startDate = startOfMonth(currentDate);
                endDate = endOfMonth(currentDate);
            }

            const [balanceData, txResponse] = await Promise.all([
                treasuryApi.getBalance(),
                treasuryApi.getTransactions({
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    page: meta.page,
                    limit: meta.limit
                })
            ]);

            setBalance(balanceData);
            // txResponse is actually { data: UnifiedTransaction[], success: boolean } because of how we typed it in api.ts
            // But we can cast it safely to handling the data property as we know it comes from the controller like that.
            setTransactions((txResponse as any).data || []);

            if ((txResponse as any).meta) {
                setMeta((txResponse as any).meta);
            }

        } catch (error) {
            console.error(error);
            toast.error('Error cargando datos de tesorería');
        } finally {
            setIsLoading(false);
        }
    };

    // Refetch when filters change
    useEffect(() => {
        if (user?.features?.treasury) {
            fetchData();
        }
    }, [user, currentDate, viewMode, meta.page]); // Depend on page too

    const navigateDate = (direction: 'PREV' | 'NEXT') => {
        const modifier = direction === 'NEXT' ? 1 : -1;
        if (viewMode === 'DAILY') {
            setCurrentDate(d => addDays(d, modifier));
        } else {
            setCurrentDate(d => addMonths(d, modifier));
        }
        setMeta(prev => ({ ...prev, page: 1 })); // Reset to page 1
    };

    const handleToday = () => {
        setCurrentDate(new Date());
        setMeta(prev => ({ ...prev, page: 1 }));
    };

    if (!user?.features?.treasury) return null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tesorería</h1>
                    <p className="text-muted-foreground">Gestión de flujo de caja</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Registrar Movimiento
                    </Button>
                </div>
            </div>

            {/* Date Navigator & KPI Cards */}
            <div className="grid gap-6 md:grid-cols-[300px_1fr]">

                {/* Navigator */}
                <Card className="h-fit">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Filtros de Fecha</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Select
                            value={viewMode}
                            onValueChange={(v) => {
                                setViewMode(v as ViewMode);
                                setMeta(prev => ({ ...prev, page: 1 }));
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="DAILY">Vista Diaria</SelectItem>
                                <SelectItem value="MONTHLY">Vista Mensual</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="flex items-center justify-between bg-secondary/50 p-2 rounded-lg">
                            <Button variant="ghost" size="icon" onClick={() => navigateDate('PREV')}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            <div className="text-center">
                                <span className="block font-medium text-sm">
                                    {viewMode === 'DAILY'
                                        ? format(currentDate, "EEEE, d 'de' MMMM", { locale: es })
                                        : format(currentDate, "MMMM yyyy", { locale: es })}
                                </span>
                                {(!isSameDay(currentDate, new Date()) && viewMode === 'DAILY') && (
                                    <Button variant="link" className="h-auto p-0 text-xs text-primary" onClick={handleToday}>
                                        Ir a Hoy
                                    </Button>
                                )}
                                {(!isSameMonth(currentDate, new Date()) && viewMode === 'MONTHLY') && (
                                    <Button variant="link" className="h-auto p-0 text-xs text-primary" onClick={handleToday}>
                                        Ir a Mes Actual
                                    </Button>
                                )}
                            </div>

                            <Button variant="ghost" size="icon" onClick={() => navigateDate('NEXT')}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* KPIs */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Balance Global</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${balance?.balance && balance.balance < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                {formatCurrency(balance?.balance || 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">Total disponible en caja</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ingresos (Global)</CardTitle>
                            <ArrowUpRight className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(balance?.totalIncome || 0)}</div>
                            <p className="text-xs text-muted-foreground">Acumulado Histórico</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Egresos (Global)</CardTitle>
                            <ArrowDownLeft className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(balance?.totalExpenses || 0)}</div>
                            <p className="text-xs text-muted-foreground">Acumulado Histórico</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Unified Transaction Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>Movimientos</span>
                        {isLoading && <span className="text-xs font-normal text-muted-foreground">Actualizando...</span>}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Concepto</TableHead>
                                <TableHead>Descripción</TableHead>
                                <TableHead className="text-right">Monto</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No hay movimientos en este periodo
                                    </TableCell>
                                </TableRow>
                            ) : transactions.map((tx) => (
                                <TableRow key={tx.id}>
                                    <TableCell className="whitespace-nowrap">
                                        {/* Append T12:00:00 to ensure date stays on the same day regardless of timezone */
                                            format(new Date(`${new Date(tx.date).toISOString().split('T')[0]}T12:00:00`), "d MMM, HH:mm", { locale: es })}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            tx.source === 'LEASE_PAYMENT' ? 'default' :
                                                tx.source === 'PROPERTY_EXPENSE' ? 'secondary' :
                                                    'outline'
                                        }>
                                            {tx.source === 'LEASE_PAYMENT' ? 'Arriendo' :
                                                tx.source === 'PROPERTY_EXPENSE' ? 'Gasto Propiedad' :
                                                    'Tesorería'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">{tx.category}</TableCell>
                                    <TableCell className="max-w-[300px] truncate" title={tx.description}>
                                        {tx.description}
                                    </TableCell>
                                    <TableCell className={`text-right ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'} font-bold`}>
                                        {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.amount)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-end space-x-2 py-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setMeta(p => ({ ...p, page: p.page - 1 }))}
                            disabled={meta.page <= 1 || isLoading}
                        >
                            Anterior
                        </Button>
                        <div className="text-sm text-muted-foreground">
                            Página {meta.page} de {Math.ceil(meta.total / meta.limit) || 1}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setMeta(p => ({ ...p, page: p.page + 1 }))}
                            disabled={meta.page >= Math.ceil(meta.total / meta.limit) || isLoading}
                        >
                            Siguiente
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <TransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchData}
            />
        </div>
    );
}
