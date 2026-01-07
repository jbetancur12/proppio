import { DollarSign, Calendar, CreditCard, CheckCircle, XCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PaymentData } from "../services/paymentsApi";

interface PaymentCardProps {
    payment: PaymentData;
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
export function PaymentCard({ payment }: PaymentCardProps) {
    const status = statusConfig[payment.status];
    const StatusIcon = status.icon;

    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('es-CO');
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
    const formatMonth = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
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
            </CardContent>
        </Card>
    );
}
