import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, User, Home, DollarSign, FileText, CheckCircle, AlertTriangle, XCircle, Clock, AlertOctagon, Trash2 } from "lucide-react";
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
import { paymentTrackingApi, PendingPayment } from "../payments/services/paymentTrackingApi";
import { addDays, differenceInMonths } from "date-fns";
import { leasesApi } from "./services/leasesApi";
import { formatDateUTC } from "@/lib/dateUtils";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ContractEditor } from "./components/ContractEditor";
import { useState, useEffect } from "react";
import { api } from "@/api/client";

// Define types locally if not available in shared DTOs (ideally should be shared)
interface Template {
    id: string;
    name: string;
    content: string;
}

interface LeasePreview {
    id?: string;
    renter?: {
        firstName?: string;
        lastName?: string;
        documentNumber?: string;
    };
    unit?: {
        name?: string;
        property?: {
            name: string;
            address?: string;
        };
    };
    monthlyRent?: number;
    startDate?: string | Date;
    endDate?: string | Date;
}

function GenerateFromTemplateDialog({ lease }: { lease: LeasePreview }) {
    const [open, setOpen] = useState(false);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState("");
    const [content, setContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (open) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            api.get('/api/leases/templates').then((res: any) => setTemplates(res.data.data)).catch(console.error);
        }
    }, [open]);

    const replaceVariables = (text: string) => {
        let newContent = text;
        if (lease.renter) {
            newContent = newContent.replace(/{{renter.firstName}}/g, lease.renter.firstName || '')
                .replace(/{{renter.lastName}}/g, lease.renter.lastName || '')
                .replace(/{{renter.documentNumber}}/g, lease.renter.documentNumber || '');
        }
        if (lease.unit) {
            newContent = newContent.replace(/{{unit.name}}/g, lease.unit.name || '')
                .replace(/{{unit.property.address}}/g, lease.unit.property?.address || lease.unit.property?.name || '');
        }
        const formattedRent = lease.monthlyRent ? new Intl.NumberFormat('es-CO').format(lease.monthlyRent) : '0';
        newContent = newContent.replace(/{{monthlyRent}}/g, `$${formattedRent}`);
        newContent = newContent.replace(/{{startDate}}/g, lease.startDate ? formatDateUTC(lease.startDate) : '');
        newContent = newContent.replace(/{{endDate}}/g, lease.endDate ? formatDateUTC(lease.endDate) : '');
        return newContent;
    };

    const handleTemplateSelect = (templateId: string) => {
        setSelectedTemplateId(templateId);
        const template = templates.find(t => t.id === templateId);
        if (template) {
            setContent(replaceVariables(template.content));
        }
    };

    const handleSave = async () => {
        if (!content) return;
        setIsSaving(true);

        // Final pass replacement to catch any newly added variables
        const finalContent = replaceVariables(content);

        try {
            // Use update endpoint. Logic implies if contractContent is present, PDF is generated.
            await api.put(`/api/leases/${lease.id}`, { contractContent: finalContent });
            toast.success("Contrato generado y guardado exitosamente");
            setOpen(false);
            window.location.reload();
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar el contrato");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full sm:w-auto border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                    <FileText size={14} className="mr-2" /> Generar desde Plantilla
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Generar Contrato desde Plantilla</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Seleccionar Plantilla</label>
                        <select
                            className="w-full p-2 border rounded-md"
                            value={selectedTemplateId}
                            onChange={(e) => handleTemplateSelect(e.target.value)}
                        >
                            <option value="">Seleccione...</option>
                            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>

                    {selectedTemplateId && (
                        <div className="border rounded-md p-1 min-h-[400px]">
                            <ContractEditor
                                initialContent={content}
                                onUpdate={setContent}
                                previewData={lease as unknown as Record<string, unknown>}
                                variables={[
                                    { label: "Nombre Inquilino", value: "{{renter.firstName}}" },
                                    { label: "Apellido Inquilino", value: "{{renter.lastName}}" },
                                    { label: "Cédula", value: "{{renter.documentNumber}}" },
                                    { label: "Dirección Inmueble", value: "{{unit.property.address}}" },
                                    { label: "Unidad", value: "{{unit.name}}" },
                                    { label: "Canon", value: "{{monthlyRent}}" },
                                    { label: "Fecha Inicio", value: "{{startDate}}" },
                                    { label: "Fecha Fin", value: "{{endDate}}" },
                                ]}
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={!selectedTemplateId || isSaving}>
                            {isSaving ? 'Guardando...' : 'Guardar y Generar PDF'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

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
                <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
                    {lease.status === 'DRAFT' && (
                        <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto" onClick={handleActivate} disabled={activateMutation.isPending}>
                            {activateMutation.isPending ? 'Activando...' : 'Activar Contrato'}
                        </Button>
                    )}
                    {lease.status === 'ACTIVE' && (
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <LeaseRenewalSection
                                leaseId={id!}
                                monthlyRent={lease.monthlyRent}
                                startDate={lease.startDate}
                                renewalCount={(lease as unknown as { renewalCount: number }).renewalCount}
                                noticeRequiredDays={(lease as unknown as { noticeRequiredDays: number }).noticeRequiredDays}
                                earlyTerminationPenalty={(lease as unknown as { earlyTerminationPenalty: number }).earlyTerminationPenalty}
                            />
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="w-full sm:w-auto">
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
                        </div>
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
                            Quedan <strong>{daysUntilExpiry} días</strong> para finalizar (Fecha fin: {formatDateUTC(lease.endDate)}).
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
                            {pendingPayments.map((pending: PendingPayment) => (
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
                                                navigate(`/payments?paymentId=${pending.id}`);
                                            }}
                                        >
                                            Registrar Pago
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 w-7 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => {
                                                if (confirm('¿Está seguro de eliminar este cobro pendiente?')) {
                                                    paymentTrackingApi.deletePayment(pending.id)
                                                        .then(() => {
                                                            toast.success('Cobro eliminado exitosamente');
                                                            window.location.reload();
                                                        })
                                                        .catch(() => toast.error('Error al eliminar cobro'));
                                                }
                                            }}
                                            title="Eliminar cobro"
                                        >
                                            <Trash2 size={16} />
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
                                <p className="font-medium flex items-center gap-2"><Calendar size={16} className="text-gray-400" /> {formatDateUTC(lease.startDate)}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500 uppercase">Fin</label>
                                <p className="font-medium flex items-center gap-2"><Clock size={16} className="text-gray-400" /> {formatDateUTC(lease.endDate)}</p>
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
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded border border-gray-200">
                                            <FileText size={24} className="text-red-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Contrato de Arrendamiento</p>
                                            <p className="text-xs text-gray-500">PDF Firmado (Máx. 5MB)</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                        <input
                                            type="file"
                                            id="upload-contract"
                                            className="hidden"
                                            accept="application/pdf"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    if (file.size > 5 * 1024 * 1024) {
                                                        toast.error("El archivo no debe superar los 5MB");
                                                        return;
                                                    }
                                                    uploadContractMutation.mutate({ id: id!, file });
                                                }
                                            }}
                                        />
                                        {lease.contractPdfPath ? (
                                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:items-center">
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 justify-center sm:justify-start w-full sm:w-auto">
                                                    Subido
                                                </Badge>
                                                <div className="flex gap-2 w-full sm:w-auto">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1 sm:flex-none"
                                                        onClick={async () => {
                                                            try {
                                                                const url = await leasesApi.getContractUrl(id!);
                                                                window.open(url, '_blank');
                                                            } catch {
                                                                toast.error("Error al descargar el contrato");
                                                            }
                                                        }}
                                                    >
                                                        <FileText size={14} className="mr-1" /> Ver
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-1 sm:flex-none"
                                                        onClick={async () => {
                                                            if (confirm('¿Está seguro de eliminar el documento del contrato? Esta acción eliminará el archivo permanentemente.')) {
                                                                try {
                                                                    await leasesApi.deleteContract(id!);
                                                                    toast.success("Contrato eliminado exitosamente");
                                                                    window.location.reload();
                                                                    window.location.reload();
                                                                } catch {
                                                                    toast.error("Error al eliminar el contrato");
                                                                }
                                                            }
                                                        }}
                                                        title="Eliminar Contrato"
                                                    >
                                                        <Trash2 size={14} className="mr-1" /> Eliminar
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2 w-full sm:w-auto">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full sm:w-auto"
                                                    onClick={() => document.getElementById('upload-contract')?.click()}
                                                    disabled={uploadContractMutation.isPending}
                                                    title="El archivo debe pesar menos de 5MB"
                                                >
                                                    {uploadContractMutation.isPending ? 'Subiendo...' : 'Subir PDF'}
                                                </Button>
                                                <GenerateFromTemplateDialog lease={lease} />
                                            </div>
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
                                        {/* Add 1 day to end date to calculate full duration cycle (e.g. Jan 1 to Dec 31 is 12 months) */
                                            differenceInMonths(addDays(new Date(lease.endDate), 1), new Date(lease.startDate))} meses
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
                                    <PaymentCard
                                        key={payment.id}
                                        payment={payment}
                                        onAction={(p) => navigate(`/payments?paymentId=${p.id}`)}
                                        onDelete={(id) => {
                                            if (confirm('¿Está seguro de eliminar este cobro pendiente?')) {
                                                paymentTrackingApi.deletePayment(Number(id) ? String(id) : id) // Handle potentially numeric id? No, usually string. Safest to just pass id.
                                                    .then(() => {
                                                        toast.success('Cobro eliminado exitosamente');
                                                        window.location.reload();
                                                    })
                                                    .catch(() => toast.error('Error al eliminar cobro'));
                                            }
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
