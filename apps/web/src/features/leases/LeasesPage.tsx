import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Plus, Search, FileText } from "lucide-react";
import { useLeases, useCreateLease, useActivateLease, useTerminateLease } from "./hooks/useLeases";
import { useRenters } from "../renters/hooks/useRenters";
import { useProperties } from "../properties/hooks/useProperties";
import { LeaseCard } from "./components/LeaseCard";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createLeaseSchema, CreateLeaseDto } from "@proppio/shared";
import { FormField } from "@/components/forms/FormField";

/**
 * LeasesPage - Container component
 * Following design_guidelines.md section 3.1
 */
export function LeasesPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isCreating, setIsCreating] = useState(false);
    const [duration, setDuration] = useState("12"); // For date calculation

    const { data: leases, isLoading } = useLeases();
    const { data: renters } = useRenters();
    const { data: properties } = useProperties();
    const createMutation = useCreateLease();
    const activateMutation = useActivateLease();
    const terminateMutation = useTerminateLease();

    // Form with validation
    const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<CreateLeaseDto>({
        resolver: zodResolver(createLeaseSchema),
        defaultValues: {
            monthlyRent: 0
        }
    });

    const startDate = watch('startDate');
    const unitId = watch('unitId');

    // Effect to handle URL params for creation
    useEffect(() => {
        if (searchParams.get('create') === 'true') {
            setIsCreating(true);
        }
        const paramUnitId = searchParams.get('unitId');
        if (paramUnitId) {
            setValue('unitId', paramUnitId);
        }
    }, [searchParams, setValue]);

    // Auto-calculate End Date
    useEffect(() => {
        if (startDate && duration) {
            const start = new Date(startDate);
            if (!isNaN(start.getTime())) {
                const end = new Date(start);
                end.setMonth(end.getMonth() + parseInt(duration));
                end.setDate(end.getDate() - 1);
                setValue('endDate', end.toISOString().split('T')[0]);
            }
        }
    }, [startDate, duration, setValue]);

    // Flatten units from all properties
    const allUnits = properties?.flatMap((p: any) =>
        (p.units || []).map((u: any) => ({ ...u, propertyName: p.name }))
    ) || [];

    const onSubmit = (data: CreateLeaseDto) => {
        createMutation.mutate(data, {
            onSuccess: () => {
                reset();
                setDuration("12");
                setIsCreating(false);
            }
        });
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Contratos</h1>
                    <p className="text-gray-500">Gestiona los contratos de arrendamiento.</p>
                </div>
                <Button onClick={() => setIsCreating(!isCreating)} className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus size={18} className="mr-2" /> Nuevo Contrato
                </Button>
            </div>


            {/* Create Form */}
            {isCreating && (
                <Card className="animate-in fade-in slide-in-from-top-4 border-indigo-100 bg-indigo-50/50">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <CardHeader>
                            <CardTitle className="text-indigo-900">Nuevo Contrato de Arrendamiento</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Unidad" error={errors.unitId?.message} required>
                                <select
                                    {...register('unitId')}
                                    className={`w-full h-10 px-3 rounded-md border ${errors.unitId ? 'border-destructive' : 'border-gray-200'} bg-white`}
                                >
                                    <option value="">Seleccionar unidad...</option>
                                    {allUnits.map((u: any) => (
                                        <option key={u.id} value={u.id}>{u.propertyName} - {u.name}</option>
                                    ))}
                                </select>
                            </FormField>
                            <FormField label="Inquilino" error={errors.renterId?.message} required>
                                <select
                                    {...register('renterId')}
                                    className={`w-full h-10 px-3 rounded-md border ${errors.renterId ? 'border-destructive' : 'border-gray-200'} bg-white`}
                                >
                                    <option value="">Seleccionar inquilino...</option>
                                    {renters?.map((r: any) => (
                                        <option key={r.id} value={r.id}>{r.firstName} {r.lastName}</option>
                                    ))}
                                </select>
                            </FormField>
                            <FormField label="Fecha Inicio" error={errors.startDate?.message} required>
                                <Input
                                    type="date"
                                    {...register('startDate')}
                                    className={`bg-white ${errors.startDate ? 'border-destructive' : ''}`}
                                />
                            </FormField>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Duración (Meses)</label>
                                <Input
                                    type="number"
                                    value={duration}
                                    onChange={e => setDuration(e.target.value)}
                                    className="bg-white"
                                />
                            </div>
                            <FormField label="Fecha Fin" error={errors.endDate?.message} required>
                                <Input
                                    type="date"
                                    {...register('endDate')}
                                    className={`bg-white ${errors.endDate ? 'border-destructive' : ''}`}
                                    readOnly
                                />
                            </FormField>
                            <FormField label="Canon Mensual ($)" error={errors.monthlyRent?.message} required>
                                <Input
                                    type="number"
                                    placeholder="1500000"
                                    {...register('monthlyRent', { valueAsNumber: true })}
                                    className={`bg-white ${errors.monthlyRent ? 'border-destructive' : ''}`}
                                />
                            </FormField>
                            <FormField label="Depósito (Opcional)" error={errors.securityDeposit?.message}>
                                <Input
                                    type="number"
                                    placeholder="3000000"
                                    {...register('securityDeposit', { valueAsNumber: true })}
                                    className={`bg-white ${errors.securityDeposit ? 'border-destructive' : ''}`}
                                />
                            </FormField>
                        </CardContent>
                        <div className="px-6 pb-6 flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => { reset(); setIsCreating(false); }}>Cancelar</Button>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending ? 'Guardando...' : 'Crear Contrato'}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}


            {/* Leases List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">Todos los Contratos</h2>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <Input placeholder="Buscar contratos..." className="pl-9 bg-white" />
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2].map(i => <div key={i} className="h-40 bg-gray-100 animate-pulse rounded-xl"></div>)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {leases?.map((lease: any) => (
                            <LeaseCard
                                key={lease.id}
                                lease={lease}
                                onActivate={() => activateMutation.mutate(lease.id)}
                                onTerminate={() => terminateMutation.mutate(lease.id)}
                                onClick={() => navigate(`/leases/${lease.id}`)}
                            />
                        ))}
                        {leases?.length === 0 && (
                            <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                                    <FileText size={24} />
                                </div>
                                <h3 className="font-medium text-gray-900">No hay contratos registrados</h3>
                                <p className="text-sm text-gray-500 mt-1">Crea tu primer contrato de arrendamiento.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
