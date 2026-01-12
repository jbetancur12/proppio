import { DollarSign, Calendar, CreditCard, CheckCircle, XCircle, Clock, Download, Loader2, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Payment } from "@proppio/types";
import { useState } from "react";
import { paymentsApi } from "../services/paymentsApi";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PaymentCardProps {
    payment: Payment;
    onAction?: (payment: Payment) => void;
    onDelete?: (id: string) => void;
}

const statusConfig = {
    PENDING: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700', icon: Clock },
    COMPLETED: { label: 'Completado', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    FAILED: { label: 'Fallido', color: 'bg-red-100 text-red-700', icon: XCircle },
    REFUNDED: { label: 'Reembolsado', color: 'bg-gray-100 text-gray-700', icon: XCircle },
};

const methodLabels: Record<string, string> = {
    CASH: 'Efectivo',
    TRANSFER: 'Transferencia',
    CHECK: 'Cheque',
    CARD: 'Tarjeta',
    OTHER: 'Otro'
};

/**
 * Presentational component for Payment
 * Following design_guidelines.md section 3.1
 */
export function PaymentCard({ payment, onAction, onDelete }: PaymentCardProps) {
    const [isDownloading, setIsDownloading] = useState(false);
    const status = statusConfig[payment.status];
    const StatusIcon = status.icon;

    const formatDate = (dateStr: string) => {
        // Handle timezone offset: server sends UTC 00:00, browser shifts to previous day.
        // We force noon (12:00) to ensure it stays on the correct day in local time.
        const date = new Date(dateStr);
        const bufferDate = new Date(date.toISOString().split('T')[0] + 'T12:00:00');
        return bufferDate.toLocaleDateString('es-CO');
    };
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
    const formatMonth = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
    };

    const handleDownload = async () => {
        try {
            setIsDownloading(true);
            await paymentsApi.downloadReceipt(payment.id, payment.reference);
        } catch {
            toast.error("Error al descargar el recibo");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Card className="hover:shadow-md transition-all duration-300 border-gray-200">
            <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 rounded-lg text-green-600">
                            <DollarSign size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">{formatCurrency(payment.amount)}</h3>
                            <p className="text-xs text-gray-500 capitalize">{formatMonth(payment.periodStart)}</p>
                        </div>
                    </div>
                    <span className={cn("px-2 py-1 rounded text-xs font-bold flex items-center gap-1", status.color)}>
                        <StatusIcon size={12} />
                        {status.label}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>{formatDate(payment.paymentDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CreditCard size={14} />
                        <span>{methodLabels[payment.method]}</span>
                    </div>
                </div>

                {payment.reference && (
                    <p className="text-xs text-gray-400 mt-2 truncate">Ref: {payment.reference}</p>
                )}

                {payment.status === 'PENDING' && (
                    <div className="mt-4 pt-2 border-t border-gray-100 flex gap-2">
                        <Button
                            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white h-8 text-xs"
                            onClick={() => onAction && onAction(payment)}
                        >
                            <CheckCircle size={14} className="mr-2" />
                            Registrar Pago
                        </Button>
                        {onDelete && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200"
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta acción eliminará el registro de pago pendiente.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => onDelete(payment.id)}
                                            className="bg-red-600 hover:bg-red-700"
                                        >
                                            Eliminar
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                )}

                {payment.status === 'COMPLETED' && (
                    <div className="mt-4 pt-2 border-t border-gray-100">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 h-8"
                            onClick={handleDownload}
                            disabled={isDownloading}
                        >
                            {isDownloading ? (
                                <Loader2 size={14} className="mr-2 animate-spin" />
                            ) : (
                                <Download size={14} className="mr-2" />
                            )}
                            Descargar Recibo
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
