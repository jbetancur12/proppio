import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Plus, Search, DollarSign, TrendingUp } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { usePayments, useCreatePayment, useUpdatePayment, useDeletePayment } from "./hooks/usePayments";
import { useLeases } from "../leases/hooks/useLeases";
import { PaymentCard } from "./components/PaymentCard";

// ... existing code ...

/**
 * PaymentsPage - Container component
 * Following design_guidelines.md section 3.1
 */
export function PaymentsPage() {
    const [isCreating, setIsCreating] = useState(false);
    const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);

    // Form state
    const [selectedLease, setSelectedLease] = useState("");
    const [amount, setAmount] = useState("");
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [periodStart, setPeriodStart] = useState("");
    const [periodEnd, setPeriodEnd] = useState("");
    const [method, setMethod] = useState("TRANSFER");
    const [reference, setReference] = useState("");

    const [searchParams] = useSearchParams();
    const autoSelectPaymentId = searchParams.get('paymentId');

    const { data: payments, isLoading } = usePayments();
    const { data: leases } = useLeases();

    // Auto-open modal if paymentId provided
    useEffect(() => {
        if (autoSelectPaymentId && payments) {
            const payment = payments.find((p: any) => p.id === autoSelectPaymentId);
            if (payment && payment.status === 'PENDING') {
                handleRegister(payment);
                // Optional: clear param
                window.history.replaceState({}, '', '/payments');
            }
        }
    }, [autoSelectPaymentId, payments]);
    const createMutation = useCreatePayment();
    const updateMutation = useUpdatePayment();
    const deleteMutation = useDeletePayment();

    const handleDelete = (id: string) => {
        deleteMutation.mutate(id);
    };


    // Filter active leases
    const activeLeases = leases?.filter((l: any) => l.status === 'ACTIVE') || [];

    // Calculate totals
    const totalReceived = payments?.filter((p: any) => p.status === 'COMPLETED')
        .reduce((sum: number, p: any) => sum + p.amount, 0) || 0;

    const handleCreateOrUpdate = () => {
        const payload = {
            leaseId: selectedLease,
            amount: Number(amount),
            paymentDate,
            periodStart,
            periodEnd,
            method,
            reference: reference || undefined,
            status: 'COMPLETED' as const
        };

        const resetForm = () => {
            setSelectedLease("");
            setAmount("");
            setPeriodStart("");
            setPeriodEnd("");
            setReference("");
            setIsCreating(false);
            setEditingPaymentId(null);
        };

        if (editingPaymentId) {
            updateMutation.mutate({
                id: editingPaymentId,
                data: {
                    ...payload,
                    method: payload.method as any
                }
            }, { onSuccess: resetForm });
        } else {
            createMutation.mutate(payload, { onSuccess: resetForm });
        }
    };

    const handleRegister = (payment: any) => {
        setEditingPaymentId(payment.id);
        setSelectedLease(payment.lease.id);
        setAmount(String(payment.amount));
        setPaymentDate(new Date().toISOString().split('T')[0]); // Default to today for payment date
        setPeriodStart(payment.periodStart.split('T')[0]);
        setPeriodEnd(payment.periodEnd.split('T')[0]);
        setMethod(payment.method || "TRANSFER");
        setReference(payment.reference || "");
        setIsCreating(true);
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Pagos</h1>
                    <p className="text-gray-500">Registro y seguimiento de pagos de arrendamiento.</p>
                </div>
                <Button onClick={() => { setIsCreating(!isCreating); setEditingPaymentId(null); }} className="bg-green-600 hover:bg-green-700">
                    <Plus size={18} className="mr-2" /> Registrar Pago
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 font-medium">Total Recaudado</p>
                                <h3 className="text-2xl font-bold mt-1">{formatCurrency(totalReceived)}</h3>
                            </div>
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm"><DollarSign className="text-white" /></div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 font-medium">Pagos Este Mes</p>
                                <h3 className="text-2xl font-bold mt-1 text-gray-900">{payments?.length || 0}</h3>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><TrendingUp /></div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 font-medium">Contratos Activos</p>
                                <h3 className="text-2xl font-bold mt-1 text-gray-900">{activeLeases.length}</h3>
                            </div>
                            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600"><DollarSign /></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Create Form */}
            {isCreating && (
                <Card className="animate-in fade-in slide-in-from-top-4 border-green-100 bg-green-50/50">
                    <CardHeader>
                        <CardTitle className="text-green-900">
                            {editingPaymentId ? 'Completar Pago Pendiente' : 'Registrar Nuevo Pago'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium">Contrato</label>
                            <select
                                className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white"
                                value={selectedLease}
                                onChange={e => {
                                    setSelectedLease(e.target.value);
                                    const lease = activeLeases.find((l: any) => l.id === e.target.value);
                                    if (lease) setAmount(String(lease.monthlyRent));
                                }}
                                disabled={!!editingPaymentId}
                            >
                                <option value="">Seleccionar contrato activo...</option>
                                {activeLeases.map((l: any) => (
                                    <option key={l.id} value={l.id}>
                                        {l.unit?.name} - {l.renter?.firstName} {l.renter?.lastName} ({formatCurrency(l.monthlyRent)}/mes)
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Monto ($)</label>
                            <Input type="number" placeholder="1500000" value={amount} onChange={e => setAmount(e.target.value)} className="bg-white" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Fecha de Pago</label>
                            <Input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="bg-white" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Período Desde</label>
                            <Input type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)} className="bg-white" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Período Hasta</label>
                            <Input type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} className="bg-white" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Método de Pago</label>
                            <select
                                className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white"
                                value={method}
                                onChange={e => setMethod(e.target.value)}
                            >
                                <option value="TRANSFER">Transferencia</option>
                                <option value="CASH">Efectivo</option>
                                <option value="CHECK">Cheque</option>
                                <option value="CARD">Tarjeta</option>
                                <option value="OTHER">Otro</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Referencia (Opcional)</label>
                            <Input placeholder="Número de transacción" value={reference} onChange={e => setReference(e.target.value)} className="bg-white" />
                        </div>
                    </CardContent>
                    <div className="px-6 pb-6 flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => { setIsCreating(false); setEditingPaymentId(null); }}>Cancelar</Button>
                        <Button
                            onClick={handleCreateOrUpdate}
                            disabled={!selectedLease || !amount || !periodStart || !periodEnd || createMutation.isPending || updateMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {createMutation.isPending || updateMutation.isPending ? 'Guardando...' : 'Registrar Pago'}
                        </Button>
                    </div>
                </Card>
            )}

            {/* Payments List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">Historial de Pagos</h2>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <Input placeholder="Buscar pagos..." className="pl-9 bg-white" />
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <div key={i} className="h-36 bg-gray-100 animate-pulse rounded-xl"></div>)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {payments?.map((payment: any) => (
                            <PaymentCard
                                key={payment.id}
                                payment={payment}
                                onAction={handleRegister}
                                onDelete={handleDelete}
                            />
                        ))}
                        {payments?.length === 0 && (
                            <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                                    <DollarSign size={24} />
                                </div>
                                <h3 className="font-medium text-gray-900">No hay pagos registrados</h3>
                                <p className="text-sm text-gray-500 mt-1">Registra tu primer pago de arrendamiento.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
