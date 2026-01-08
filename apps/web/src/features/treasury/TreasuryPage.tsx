import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { treasuryApi, GlobalBalance, UnifiedTransaction } from './services/treasuryApi';
import { TransactionModal } from './components/TransactionModal';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export function TreasuryPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [balance, setBalance] = useState<GlobalBalance | null>(null);
    const [transactions, setTransactions] = useState<UnifiedTransaction[]>([]);
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
        try {
            const [balanceData, txData] = await Promise.all([
                treasuryApi.getBalance(),
                treasuryApi.getTransactions()
            ]);
            setBalance(balanceData);
            setTransactions(txData);
        } catch (error) {
            console.error(error);
            toast.error('Error cargando datos de tesorería');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user?.features?.treasury) {
            fetchData();
        }
    }, [user]);

    if (!user?.features?.treasury) return null;

    if (isLoading) return <div className="p-8 text-center">Cargando tesorería...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tesorería</h1>
                    <p className="text-muted-foreground">Gestión unificada de flujo de caja</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Registrar Movimiento
                </Button>
            </div>

            {/* KPI Cards */}
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
                        <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(balance?.totalIncome || 0)}</div>
                        <p className="text-xs text-muted-foreground">Arriendos + Otros Ingresos</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Egresos</CardTitle>
                        <ArrowDownLeft className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(balance?.totalExpenses || 0)}</div>
                        <p className="text-xs text-muted-foreground">Gastos Propiedades + Otros Gastos</p>
                    </CardContent>
                </Card>
            </div>

            {/* Unified Transaction Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Movimientos Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Concepto</TableHead>
                                <TableHead>Descripción</TableHead>
                                <TableHead>Monto</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((tx) => (
                                <TableRow key={tx.id}>
                                    <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
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
                                    <TableCell>{tx.description}</TableCell>
                                    <TableCell className={`${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'} font-bold`}>
                                        {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.amount)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
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
