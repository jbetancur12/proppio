import { FileText, Calendar, DollarSign, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LeaseData } from "../services/leasesApi";

interface LeaseCardProps {
    lease: LeaseData;
    onActivate?: () => void;
    onTerminate?: () => void;
    onClick?: () => void;
}

const statusConfig = {
    DRAFT: { label: 'Borrador', color: 'bg-gray-100 text-gray-700' },
    ACTIVE: { label: 'Activo', color: 'bg-green-100 text-green-700' },
    EXPIRED: { label: 'Expirado', color: 'bg-amber-100 text-amber-700' },
    TERMINATED: { label: 'Terminado', color: 'bg-red-100 text-red-700' },
};

/**
 * Presentational component for Lease
 * Following design_guidelines.md section 3.1
 */
export function LeaseCard({ lease, onActivate, onTerminate, onClick }: LeaseCardProps) {
    const status = statusConfig[lease.status];
    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('es-CO');
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);

    return (
        <Card
            className={cn("hover:shadow-lg transition-all duration-300 border-gray-200", onClick && "cursor-pointer")}
            onClick={onClick}
        >
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">{lease.unit?.name || 'Unidad'}</h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                <User size={12} />
                                {lease.renter?.firstName} {lease.renter?.lastName}
                            </p>
                        </div>
                    </div>
                    <span className={cn("px-2 py-1 rounded text-xs font-bold uppercase", status.color)}>
                        {status.label}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={14} />
                        <span>{formatDate(lease.startDate)} - {formatDate(lease.endDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-900 font-semibold">
                        <DollarSign size={14} />
                        <span>{formatCurrency(lease.monthlyRent)}/mes</span>
                    </div>
                </div>

                {(lease.status === 'DRAFT' || lease.status === 'ACTIVE') && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                        {lease.status === 'DRAFT' && onActivate && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={onActivate}>
                                Activar
                            </Button>
                        )}
                        {lease.status === 'ACTIVE' && onTerminate && (
                            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={onTerminate}>
                                Terminar
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
