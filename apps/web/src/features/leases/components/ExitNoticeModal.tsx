import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, DollarSign } from 'lucide-react';
import { useCreateExitNotice } from '../hooks/useExitNotice';

interface ExitNoticeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    leaseId: string;
    monthlyRent: number;
    startDate: string;
    noticeRequiredDays?: number;
    earlyTerminationPenalty?: number;
}

export function ExitNoticeModal({
    open,
    onOpenChange,
    leaseId,
    monthlyRent,
    startDate,
    noticeRequiredDays = 90,
    earlyTerminationPenalty
}: ExitNoticeModalProps) {
    const [plannedExitDate, setPlannedExitDate] = useState('');
    const [reason, setReason] = useState('');
    const [mutualAgreement, setMutualAgreement] = useState(false);

    const createMutation = useCreateExitNotice();

    // Calculate if in first year
    const oneYearFromStart = new Date(startDate);
    oneYearFromStart.setFullYear(oneYearFromStart.getFullYear() + 1);
    const isInFirstYear = plannedExitDate ? new Date(plannedExitDate) < oneYearFromStart : false;

    // Calculate penalty
    const penaltyAmount = isInFirstYear && !mutualAgreement
        ? (earlyTerminationPenalty || monthlyRent * 2)
        : 0;

    // Calculate days notice
    const daysNotice = plannedExitDate
        ? Math.ceil((new Date(plannedExitDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    const isValidNotice = daysNotice >= noticeRequiredDays;

    const handleSubmit = () => {
        if (!plannedExitDate) return;

        createMutation.mutate({
            leaseId,
            data: {
                plannedExitDate,
                reason: reason || undefined,
                mutualAgreement
            }
        }, {
            onSuccess: () => {
                onOpenChange(false);
                setPlannedExitDate('');
                setReason('');
                setMutualAgreement(false);
            }
        });
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Registrar Aviso de Salida</DialogTitle>
                    <DialogDescription>
                        El inquilino debe notificar con {noticeRequiredDays} días de anticipación.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Planned Exit Date */}
                    <div className="space-y-2">
                        <Label htmlFor="plannedExitDate">Fecha Planeada de Salida *</Label>
                        <Input
                            id="plannedExitDate"
                            type="date"
                            value={plannedExitDate}
                            onChange={(e) => setPlannedExitDate(e.target.value)}
                            min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]}
                        />
                        {plannedExitDate && !isValidNotice && (
                            <div className="flex items-start gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
                                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                                <span>
                                    Se requieren {noticeRequiredDays} días de aviso. Solo proporcionó {daysNotice} días.
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Reason */}
                    <div className="space-y-2">
                        <Label htmlFor="reason">Razón (Opcional)</Label>
                        <Input
                            id="reason"
                            placeholder="Ej: Cambio de ciudad, compra de vivienda..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>

                    {/* Mutual Agreement */}
                    {isInFirstYear && (
                        <div className="space-y-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex items-start gap-2">
                                <AlertCircle size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-blue-900">
                                    <p className="font-medium">Período Mínimo Forzoso</p>
                                    <p className="text-blue-700 mt-1">
                                        El contrato está en su primer año. Se aplicará una penalidad por terminación anticipada.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 mt-3">
                                <Checkbox
                                    id="mutualAgreement"
                                    checked={mutualAgreement}
                                    onCheckedChange={(checked) => setMutualAgreement(checked === true)}
                                />
                                <Label htmlFor="mutualAgreement" className="text-sm font-normal cursor-pointer">
                                    Mutuo acuerdo (exonera penalidad)
                                </Label>
                            </div>
                        </div>
                    )}

                    {/* Penalty Display */}
                    {penaltyAmount > 0 && (
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <div className="flex items-center gap-2 text-red-900">
                                <DollarSign size={18} className="text-red-600" />
                                <div>
                                    <p className="font-medium text-sm">Penalidad por Terminación Anticipada</p>
                                    <p className="text-2xl font-bold mt-1">{formatCurrency(penaltyAmount)}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!plannedExitDate || !isValidNotice || createMutation.isPending}
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        {createMutation.isPending ? 'Registrando...' : 'Registrar Aviso'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
