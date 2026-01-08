import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { TrendingUp, Calculator, AlertCircle } from 'lucide-react';
import { useRentIncreasePreviews, useBulkApplyIncreases, useSetIPC, useIPCConfig } from './hooks/useRentIncrease';
import { ApplyIncreaseDto } from './services/rentIncreaseApi';

export function RentIncreasePage() {
    const currentYear = new Date().getFullYear();
    const [increasePercentage, setIncreasePercentage] = useState<number>(0);
    const [selectedLeases, setSelectedLeases] = useState<Set<string>>(new Set());
    const [effectiveDate, setEffectiveDate] = useState<string>(`${currentYear + 1}-01-01`);
    const [ipcYear, setIpcYear] = useState<number>(currentYear);
    const [ipcRate, setIpcRate] = useState<string>('');
    const [rentOverrides, setRentOverrides] = useState<Record<string, number>>({});
    const [showIneligible, setShowIneligible] = useState(false);

    const { data: previews = [], isLoading } = useRentIncreasePreviews(increasePercentage, effectiveDate);

    // Derived state
    const eligiblePreviews = previews.filter(p => p.eligible);
    const filteredPreviews = showIneligible ? previews : eligiblePreviews;

    const bulkApply = useBulkApplyIncreases();
    const { data: ipcConfig } = useIPCConfig(ipcYear);
    const setIPCMutation = useSetIPC();

    const handleToggleAll = () => {
        if (selectedLeases.size === eligiblePreviews.length && eligiblePreviews.length > 0) {
            setSelectedLeases(new Set());
        } else {
            setSelectedLeases(new Set(eligiblePreviews.map(p => p.leaseId)));
        }
    };

    const handleToggleLease = (leaseId: string) => {
        const newSelected = new Set(selectedLeases);
        if (newSelected.has(leaseId)) {
            newSelected.delete(leaseId);
        } else {
            newSelected.add(leaseId);
        }
        setSelectedLeases(newSelected);
    };

    const handleRentChange = (leaseId: string, value: string) => {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            setRentOverrides(prev => ({
                ...prev,
                [leaseId]: numValue
            }));
            // Auto-select when modified
            if (!selectedLeases.has(leaseId)) {
                handleToggleLease(leaseId);
            }
        }
    };

    const handleApplyIncreases = () => {
        if (selectedLeases.size === 0) return;

        const increases: ApplyIncreaseDto[] = previews
            .filter(p => selectedLeases.has(p.leaseId))
            .map(p => {
                const newRent = rentOverrides[p.leaseId] ?? p.suggestedRent;
                // Recalculate percentage if rent changed manually
                const effectivePercentage = ((newRent - p.currentRent) / p.currentRent) * 100;

                return {
                    leaseId: p.leaseId,
                    newRent: newRent,
                    increasePercentage: Number(effectivePercentage.toFixed(2)),
                    effectiveDate,
                    reason: `Aumento IPC ${p.increasePercentage}%${newRent !== p.suggestedRent ? ' (Ajustado manualmente)' : ''}`
                };
            });

        if (confirm(`¿Aplicar ${increases.length} aumentos? Esta acción actualizará los contratos seleccionados.`)) {
            bulkApply.mutate(increases, {
                onSuccess: () => {
                    setSelectedLeases(new Set());
                    setIncreasePercentage(0);
                    setRentOverrides({});
                }
            });
        }
    };

    const handleSetIPC = () => {
        const rate = parseFloat(ipcRate);
        if (!rate || rate <= 0) return;
        setIPCMutation.mutate({ year: ipcYear, ipcRate: rate });
    };

    const handleUseIPC = () => {
        if (ipcConfig?.ipcRate) {
            setIncreasePercentage(ipcConfig.ipcRate);
        }
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Aumentos de Canon (IPC)</h1>
                <p className="text-gray-600">Aplicar aumentos anuales a los contratos activos</p>
            </div>

            {/* IPC Config */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Configurar IPC
                    </CardTitle>
                    <CardDescription>Guarda el IPC anual para usarlo en los cálculos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label>Año</Label>
                            <Input
                                type="number"
                                value={ipcYear}
                                onChange={(e) => setIpcYear(parseInt(e.target.value))}
                                min={2020}
                                max={2050}
                            />
                        </div>
                        <div>
                            <Label>IPC (%)</Label>
                            <Input
                                type="number"
                                step="0.1"
                                value={ipcRate}
                                onChange={(e) => setIpcRate(e.target.value)}
                                placeholder="Ej: 9.5"
                            />
                        </div>
                        <div className="flex items-end">
                            <Button onClick={handleSetIPC} disabled={setIPCMutation.isPending}>
                                Guardar IPC
                            </Button>
                        </div>
                    </div>
                    {ipcConfig?.ipcRate && (
                        <div className="bg-blue-50 border border-blue-200 p-3 rounded-md text-sm">
                            <strong>IPC {ipcConfig.year}:</strong> {ipcConfig.ipcRate}%
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Calculate Increases */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Calcular Aumentos
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <Label>Porcentaje de Aumento (%)</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={increasePercentage || ''}
                                    onChange={(e) => setIncreasePercentage(parseFloat(e.target.value) || 0)}
                                    placeholder="Ej: 9.5"
                                />
                                {ipcConfig?.ipcRate && (
                                    <Button variant="outline" onClick={handleUseIPC}>
                                        Usar IPC {ipcConfig.year}
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div>
                            <Label>Fecha Efectiva</Label>
                            <Input
                                type="date"
                                value={effectiveDate}
                                onChange={(e) => setEffectiveDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {increasePercentage > 0 && (
                        <div className="bg-amber-50 border border-amber-200 p-3 rounded-md flex items-start gap-2 text-sm">
                            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                            <span>Se calcularán aumentos del <strong>{increasePercentage}%</strong> para todos los contratos elegibles.</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Preview Table */}
            {previews.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Vista Previa de Aumentos</CardTitle>
                                <CardDescription>
                                    {Array.from(selectedLeases).filter(leaseId => eligiblePreviews.some(p => p.leaseId === leaseId)).length} de {eligiblePreviews.length} contratos aptos seleccionados
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="show-ineligible"
                                        checked={showIneligible}
                                        onCheckedChange={(checked) => setShowIneligible(checked === true)}
                                    />
                                    <Label htmlFor="show-ineligible">Mostrar no aptos</Label>
                                </div>
                                <Button variant="outline" onClick={handleToggleAll}>
                                    {Array.from(selectedLeases).filter(leaseId => eligiblePreviews.some(p => p.leaseId === leaseId)).length === eligiblePreviews.length ? 'Deseleccionar Aptos' : 'Seleccionar Aptos'}
                                </Button>
                                <Button
                                    onClick={handleApplyIncreases}
                                    disabled={selectedLeases.size === 0 || bulkApply.isPending}
                                    className="bg-indigo-600 hover:bg-indigo-700"
                                >
                                    Aplicar {Array.from(selectedLeases).filter(leaseId => eligiblePreviews.some(p => p.leaseId === leaseId)).length} Aumentos
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-12">
                                                <Checkbox
                                                    checked={Array.from(selectedLeases).filter(leaseId => eligiblePreviews.some(p => p.leaseId === leaseId)).length > 0 && Array.from(selectedLeases).filter(leaseId => eligiblePreviews.some(p => p.leaseId === leaseId)).length === eligiblePreviews.length}
                                                    onCheckedChange={handleToggleAll}
                                                />
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Propiedad</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Unidad</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Inquilino</th>
                                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Renta Actual</th>
                                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 w-40">Nueva Renta</th>
                                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Aumento</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredPreviews.map((preview) => {
                                            const newRent = rentOverrides[preview.leaseId] ?? preview.suggestedRent;
                                            const diff = newRent - preview.currentRent;

                                            const isOverridden = rentOverrides[preview.leaseId] !== undefined && rentOverrides[preview.leaseId] !== preview.suggestedRent;
                                            const isEligible = preview.eligible;

                                            return (
                                                <tr key={preview.leaseId} className={`hover:bg-gray-50 ${!isEligible ? 'bg-gray-50 opacity-60' : ''}`}>
                                                    <td className="px-4 py-3">
                                                        <Checkbox
                                                            checked={selectedLeases.has(preview.leaseId)}
                                                            onCheckedChange={() => handleToggleLease(preview.leaseId)}
                                                            disabled={!isEligible}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">{preview.propertyName}</td>
                                                    <td className="px-4 py-3 text-sm">{preview.unitName}</td>
                                                    <td className="px-4 py-3 text-sm">{preview.renterName}</td>
                                                    <td className="px-4 py-3 text-sm text-right font-mono">{formatCurrency(preview.currentRent)}</td>
                                                    <td className="px-4 py-3 text-sm text-right">
                                                        <Input
                                                            type="number"
                                                            className={`text-right h-8 w-full font-mono ${isOverridden ? 'border-amber-400 bg-amber-50' : 'border-gray-200'}`}
                                                            value={newRent}
                                                            onChange={(e) => handleRentChange(preview.leaseId, e.target.value)}
                                                            disabled={!isEligible}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-right">
                                                        <span className={`font-medium ${diff > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                                                            +{formatCurrency(diff)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        {!isEligible ? (
                                                            <div className="text-amber-600 text-xs flex items-center gap-1 cursor-help" title={preview.rejectionReason}>
                                                                <AlertCircle size={14} />
                                                                <span className="truncate max-w-[120px]">{preview.rejectionReason}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-green-600 text-xs font-medium px-2 py-1 bg-green-50 rounded-full">
                                                                Apto
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {isLoading && <p className="text-center text-gray-500">Cargando vista previa...</p>}
        </div>
    );
}
