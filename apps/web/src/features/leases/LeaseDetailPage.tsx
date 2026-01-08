import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, User, Home, DollarSign, FileText, CheckCircle, AlertTriangle, XCircle, Clock, AlertOctagon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLease, useTerminateLease, useActivateLease, useUploadContract } from "./hooks/useLeases";
import { usePayments } from "../payments/hooks/usePayments";
import { PaymentCard } from "../payments/components/PaymentCard";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { LeaseRenewalSection } from "./components/LeaseRenewalSection";
import { usePendingPayments } from "../payments/hooks/usePaymentTracking";
import { paymentTrackingApi } from "../payments/services/paymentTrackingApi";

const statusConfig = {
    DRAFT: { label: 'Borrador', color: 'bg-gray-100 text-gray-700', icon: FileText },
    ACTIVE: { label: 'Activo', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    EXPIRED: { label: 'Vencido', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
    TERMINATED: { label: 'Terminado', color: 'bg-indigo-100 text-indigo-700', icon: XCircle },
};

export function LeaseDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: lease, isLoading } = useLease(id!);
    const { data: payments } = usePayments(id);
    const { data: pendingPayments = [] } = usePendingPayments(id!);
    const terminateMutation = useTerminateLease();
    const activateMutation = useActivateLease();
    const uploadContractMutation = useUploadContract();

    if (isLoading) return <div className="p-8 text-center text-gray-500">Cargando detalles del contrato...</div>;
    if (!lease) return <div className="p-8 text-center text-red-500">Contrato no encontrado</div>;

    const StatusIcon = statusConfig[lease.status as keyof typeof statusConfig]?.icon || FileText;
    const statusColor = statusConfig[lease.status as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-600';
    const statusLabel = statusConfig[lease.status as keyof typeof statusConfig]?.label || lease.status;

    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
    const formatCurrency = (val: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

    const handleActivate = () => {
        activateMutation.mutate(id!, {
            onSuccess: () => toast.success("Contrato activado exitosamente")
        });
    };

    const handleTerminate = () => {
        terminateMutation.mutate(id!, {
            onSuccess: () => toast.success("Contrato terminado exitosamente")
        });
    };

    const daysUntilExpiry = Math.ceil((new Date(lease.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));

    // Calculate tenant tenure (how long they've been living there)
    const calculateTenure = () => {
        const startDate = new Date(lease.startDate);
        const today = new Date();

        const yearsDiff = today.getFullYear() - startDate.getFullYear();
        const monthsDiff = today.getMonth() - startDate.getMonth();

        let totalMonths = yearsDiff * 12 + monthsDiff;

        // Adjust if the day hasn't been reached yet this month
        if (today.getDate() < startDate.getDate()) {
            totalMonths--;
        }

        const years = Math.floor(totalMonths / 12);
        const months = totalMonths % 12;

        if (totalMonths < 12) {
            return `${totalMonths} ${totalMonths === 1 ? 'mes' : 'meses'} de antigüedad`;
        } else if (months === 0) {
            return `${years} ${years === 1 ? 'año' : 'años'} de antigüedad`;
        } else {
            return `${years} ${years === 1 ? 'año' : 'años'} y ${months} ${months === 1 ? 'mes' : 'meses'} de antigüedad`;
        }
    };

    // Calculate totals
    const totalPaid = payments?.reduce((sum, p) => p.status === 'COMPLETED' ? sum + p.amount : sum, 0) || 0;
    // Expected rent roughly: months duration * monthlyRent. (This is a simplified estimation)
    // For exact "Pending" we'd need a ledger, but we can show Total Paid.

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/leases')}>
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                            Contrato #{lease.id.slice(0, 8)}
                            <Badge variant="outline" className={`${statusColor} border-0 flex items-center gap-1`}>
                                <StatusIcon size={12} /> {statusLabel}
                            </Badge>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1">
                                <Clock size={12} /> {calculateTenure()}
                            </Badge>
                            {pendingPayments.length > 0 && (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
                                    <AlertTriangle size={12} /> {pendingPayments.length} {pendingPayments.length === 1 ? 'pago pendiente' : 'pagos pendientes'}
                                </Badge>
                            )}
                        </h1>
                        <p className="text-gray-500 text-sm">
                            {lease.unit?.name} • {lease.renter?.firstName} {lease.renter?.lastName}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {lease.status === 'DRAFT' && (
                        <Button className="bg-green-600 hover:bg-green-700" onClick={handleActivate} disabled={activateMutation.isPending}>
                            {activateMutation.isPending ? 'Activando...' : 'Activar Contrato'}
                        </Button>
                    )}
                    {lease.status === 'ACTIVE' && (
                        <>
                            <LeaseRenewalSection
                                leaseId={id!}
                                monthlyRent={lease.monthlyRent}
                                startDate={lease.startDate}
                                renewalCount={(lease as any).renewalCount}
                                noticeRequiredDays={(lease as any).noticeRequiredDays}
                                earlyTerminationPenalty={(lease as any).earlyTerminationPenalty}
                            />
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">
                                        <AlertOctagon size={16} className="mr-2" /> Terminar Contrato
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta acción terminará el contrato y marcará la unidad como vacante.
                                            Esta acción no se puede deshacer fácilmente.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleTerminate} className="bg-red-600 hover:bg-red-700">
                                            Sí, Terminar
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </>
                    )}
                </div>
            </div>

            {/* Alert for Expiring */}
            {lease.status === 'ACTIVE' && daysUntilExpiry <= 60 && (
                <div className={`p-4 rounded-lg border flex items-start gap-3 ${daysUntilExpiry <= 30 ? 'bg-red-50 border-red-100 text-red-800' : 'bg-amber-50 border-amber-100 text-amber-800'}`}>
                    <AlertTriangle className="mt-0.5 flex-shrink-0" size={20} />
                    <div>
                        <h3 className="font-bold">Este contrato vence pronto</h3>
                        <p className="text-sm opacity-90">
                            Quedan <strong>{daysUntilExpiry} días</strong> para finalizar (Fecha fin: {formatDate(lease.endDate)}).
                            Considera contactar al inquilino para renovar o coordinar la entrega.
                        </p>
                    </div>
                </div>
            )}

            {/* Pending Payments Alert */}
            {pendingPayments.length > 0 && (
                <div className="p-4 rounded-lg border bg-red-50 border-red-100 text-red-800 flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 flex-shrink-0" size={20} />
                    <div className="flex-1">
                        <h3 className="font-bold">Facturas Pendientes</h3>
                        <p className="text-sm opacity-90 mb-2">
                            {pendingPayments.length} {pendingPayments.length === 1 ? 'cobro pendiente' : 'cobros pendientes'} por gestionar.
                        </p>
                        <ul className="text-sm space-y-2">
                            {pendingPayments.map((pending) => (
                                <li key={pending.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-white rounded border border-red-100">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-900">{pending.description || `Arriendo ${new Date(pending.periodStart).toLocaleDateString('es-CO', { month: 'long' })}`}</span>
                                        <span className="text-xs text-gray-500">
                                            Vence: {new Date(pending.paymentDate).toLocaleDateString('es-CO', { dateStyle: 'medium' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-red-700 mr-2">{formatCurrency(pending.amount)}</span>
                                        <Button
                                            size="sm"
                                            className="h-7 text-xs bg-red-600 hover:bg-red-700"
                                            onClick={() => {
                                                // Trigger payment modal with pre-filled data
                                                // TODO: Implement openPaymentModal logic
                                                // For now, simpler: Navigate to payments page or open separate modal?
                                                // Better: "Registrar Pago" functionality needs a way to pass context.
                                                // We can emit event or set state if PaymentModal is accessible.
                                                // Assuming we can add a PaymentModal here or use existing mechanism.
                                                navigate('/payments'); // Temporary until modal logic is refined
                                            }}
                                        >
                                            Pagar
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 w-7 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                                            onClick={() => {
                                                if (confirm('¿Está seguro de eliminar este cobro pendiente?')) {
                                                    paymentTrackingApi.deletePayment(pending.id)
                                                        .then(() => {
                                                            toast.success('Cobro eliminado exitosamente');
                                                            // Trigger refetch of pending payments
                                                            // For now, simple page reload or we need query invalidation hook
                                                            // Better: Invalidate query if we use useQuery properly
                                                            // Since usePendingPayments uses useQuery, we can access queryClient
                                                            // But simpler for quick fix: window.location.reload() or navigate
                                                            // Let's rely on React Query cache invalidation if possible, but context is missing here.
                                                            // Fallback: reload
                                                            window.location.reload();
                                                        })
                                                        .catch(() => toast.error('Error al eliminar cobro'));
                                                }
                                            }}
                                        >
                                            <XCircle size={16} />
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText size={18} className="text-indigo-600" /> Detalles del Acuerdo
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500 uppercase">Inicio</label>
                                <p className="font-medium flex items-center gap-2"><Calendar size={16} className="text-gray-400" /> {formatDate(lease.startDate)}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500 uppercase">Fin</label>
                                <p className="font-medium flex items-center gap-2"><Clock size={16} className="text-gray-400" /> {formatDate(lease.endDate)}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500 uppercase">Canon Mensual</label>
                                <p className="font-medium text-lg text-indigo-700">{formatCurrency(lease.monthlyRent)}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500 uppercase">Depósito de Seguridad</label>
                                <p className="font-medium">{lease.securityDeposit ? formatCurrency(lease.securityDeposit) : 'No aplica'}</p>
                            </div>
                            {lease.notes && (
                                <div className="col-span-full bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Notas</label>
                                    <p className="text-sm text-gray-700">{lease.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Documents Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText size={18} className="text-gray-600" /> Documentos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Contract File */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded border border-gray-200">
                                            <FileText size={24} className="text-red-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Contrato de Arrendamiento</p>
                                            <p className="text-xs text-gray-500">PDF Firmado</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="file"
                                            id="upload-contract"
                                            className="hidden"
                                            accept="application/pdf"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    uploadContractMutation.mutate({ id: id!, file });
                                                }
                                            }}
                                        />
                                        {lease.contractPdfPath ? (
                                            <div className="flex gap-2 items-center">
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                    Subido
                                                </Badge>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={async () => {
                                                        try {
                                                            const { leasesApi } = await import("./services/leasesApi");
                                                            const url = await leasesApi.getContractUrl(id!);
                                                            window.open(url, '_blank');
                                                        } catch (error) {
                                                            toast.error("Error al descargar el contrato");
                                                        }
                                                    }}
                                                >
                                                    <FileText size={14} className="mr-1" /> Ver/Descargar
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => document.getElementById('upload-contract')?.click()}
                                                disabled={uploadContractMutation.isPending}
                                            >
                                                {uploadContractMutation.isPending ? 'Subiendo...' : 'Subir PDF'}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Entities Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Home size={16} className="text-gray-500" /> Unidad Arrendada
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <h3 className="text-xl font-bold text-gray-900">{lease.unit?.name}</h3>
                                <p className="text-sm text-gray-500 mt-1">{lease.unit?.property?.name || 'Propiedad Principal'}</p>
                                <Button variant="link" className="p-0 h-auto text-indigo-600 mt-2" onClick={() => navigate(`/properties/${lease.unit?.property?.id}`)}>
                                    Ver Propiedad &rarr;
                                </Button>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <User size={16} className="text-gray-500" /> Inquilino Principal
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <h3 className="text-xl font-bold text-gray-900">{lease.renter?.firstName} {lease.renter?.lastName}</h3>
                                <div className="text-sm text-gray-500 mt-2 space-y-1">
                                    <p>{lease.renter?.email}</p>
                                    <p>{lease.renter?.phone}</p>
                                </div>
                                <Button variant="link" className="p-0 h-auto text-indigo-600 mt-2" onClick={() => navigate(`/renters`)}>
                                    Ver Perfil &rarr;
                                </Button>
                            </CardContent>
                        </Card>
                    </div>


                </div>

                {/* Sidebar / Financials */}
                <div className="space-y-6">
                    <Card className="bg-indigo-50 border-indigo-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-indigo-900 text-lg">
                                <DollarSign size={20} /> Resumen Financiero
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-indigo-700 font-medium">Total Pagado</p>
                                <p className="text-3xl font-bold text-indigo-900">{formatCurrency(totalPaid)}</p>
                            </div>
                            <div className="pt-4 border-t border-indigo-200">
                                <div className="flex justify-between items-center text-sm mb-1">
                                    <span className="text-indigo-700">Pagos Registrados</span>
                                    <span className="font-bold text-indigo-900">{payments?.length || 0}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-indigo-700">Duración</span>
                                    <span className="font-bold text-indigo-900">
                                        {Math.ceil((new Date(lease.endDate).getTime() - new Date(lease.startDate).getTime()) / (1000 * 3600 * 24 * 30))} meses
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-3">
                        <h3 className="font-bold text-gray-900 flex items-center justify-between">
                            Historial de Pagos
                            <Button variant="outline" size="sm" onClick={() => navigate('/payments')}>Ver Todos</Button>
                        </h3>
                        {payments?.length === 0 ? (
                            <div className="text-center p-4 border border-dashed rounded-lg text-gray-400 text-sm">
                                No hay pagos registrados
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                {payments?.map(payment => (
                                    <PaymentCard key={payment.id} payment={payment} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
