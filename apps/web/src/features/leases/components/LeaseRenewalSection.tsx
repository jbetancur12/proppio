import { useState } from 'react';
import { LogOut, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ExitNoticeModal } from './ExitNoticeModal';
import { useExitNotices } from '../hooks/useExitNotice';

interface LeaseRenewalSectionProps {
    leaseId: string;
    monthlyRent: number;
    startDate: string;
    renewalCount?: number;
    noticeRequiredDays?: number;
    earlyTerminationPenalty?: number;
}

export function LeaseRenewalSection({
    leaseId,
    monthlyRent,
    startDate,
    renewalCount = 0,
    noticeRequiredDays,
    earlyTerminationPenalty
}: LeaseRenewalSectionProps) {
    const [exitNoticeModalOpen, setExitNoticeModalOpen] = useState(false);
    const { data: exitNotices = [] } = useExitNotices(leaseId);

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);

    return (
        <>
            {/* Renewal Badge */}
            {renewalCount > 0 && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                    <RefreshCw size={12} /> Renovado {renewalCount}x
                </Badge>
            )}

            {/* Exit Notice Button */}
            <Button
                variant="outline"
                onClick={() => setExitNoticeModalOpen(true)}
                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
                <LogOut size={16} className="mr-2" />
                Registrar Aviso de Salida
            </Button>

            {/* Exit Notice Modal */}
            <ExitNoticeModal
                open={exitNoticeModalOpen}
                onOpenChange={setExitNoticeModalOpen}
                leaseId={leaseId}
                monthlyRent={monthlyRent}
                startDate={startDate}
                noticeRequiredDays={noticeRequiredDays}
                earlyTerminationPenalty={earlyTerminationPenalty}
            />

            {/* Exit Notices List */}
            {exitNotices.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center justify-between">
                        Avisos de Salida
                        <Badge variant="outline" className="text-xs">
                            {exitNotices.length} {exitNotices.length === 1 ? 'aviso' : 'avisos'}
                        </Badge>
                    </h3>
                    <div className="space-y-3">
                        {exitNotices.map((notice) => {
                            const statusConfig = {
                                PENDING: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700' },
                                CONFIRMED: { label: 'Confirmado', color: 'bg-green-100 text-green-700' },
                                CANCELLED: { label: 'Cancelado', color: 'bg-gray-100 text-gray-700' }
                            };
                            const config = statusConfig[notice.status as keyof typeof statusConfig];

                            return (
                                <Card key={notice.id} className="border-l-4 border-l-indigo-500">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <LogOut size={16} className="text-indigo-600" />
                                                <span className="font-medium text-gray-900">
                                                    Salida planeada: {formatDate(notice.plannedExitDate)}
                                                </span>
                                            </div>
                                            <Badge className={`${config.color} border-0`}>
                                                {config.label}
                                            </Badge>
                                        </div>
                                        <div className="space-y-1 text-sm text-gray-600">
                                            <p>Aviso registrado: {formatDate(notice.noticeDate)}</p>
                                            {notice.reason && <p className="italic">Razón: {notice.reason}</p>}
                                            {notice.mutualAgreement && (
                                                <p className="text-green-600 font-medium">✓ Mutuo acuerdo</p>
                                            )}
                                            {notice.penaltyAmount && !notice.penaltyWaived && (
                                                <p className="text-red-600 font-medium">
                                                    Penalidad: {formatCurrency(notice.penaltyAmount)}
                                                </p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}
        </>
    );
}
