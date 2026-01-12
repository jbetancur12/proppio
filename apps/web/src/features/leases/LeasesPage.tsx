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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createLeaseSchema, CreateLeaseDto } from "@proppio/shared";
import { FormField } from "@/components/forms/FormField";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { toUTC } from "@/lib/dateUtils";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { api } from "@/api/client";

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
    const { register, handleSubmit, formState: { errors }, reset, setValue, watch, control } = useForm<CreateLeaseDto>({
        resolver: zodResolver(createLeaseSchema),
        defaultValues: {
            monthlyRent: 0
        }
    });

    const startDate = watch('startDate');
    const selectedUnitId = watch('unitId');
    const selectedRenterId = watch('renterId');
    const monthlyRent = watch('monthlyRent');

    // Contract Template State
    const [templates, setTemplates] = useState<any[]>([]);
    const [creationMethod, setCreationMethod] = useState<'manual' | 'template'>('manual');
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({ placeholder: 'El contenido del contrato aparecerá aquí...' }),
        ],
        content: '',
        editable: true,
    });

    // Fetch templates on mount
    useEffect(() => {
        api.get('/api/leases/templates').then(res => setTemplates(res.data.data)).catch(console.error);
    }, []);

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

    // Flatten units from all properties and filter only VACANT ones
    const allUnits = properties?.flatMap((p: any) =>
        (p.units || [])
            .filter((u: any) => u.status === 'VACANT')
            .map((u: any) => ({ ...u, propertyName: p.name }))
    ) || [];

    // Effect to auto-fill template when selected
    useEffect(() => {
        if (selectedTemplateId && selectedUnitId && selectedRenterId) {
            const template = templates.find(t => t.id === selectedTemplateId);
            if (template) {
                // Find data objects
                const unit = allUnits.find((u: any) => u.id === selectedUnitId);
                const renter = renters?.find((r: any) => r.id === selectedRenterId);

                let content = template.content;
                // Simple replacement
                if (renter) {
                    content = content.replace(/{{renter.firstName}}/g, renter.firstName || '')
                        .replace(/{{renter.lastName}}/g, renter.lastName || '')
                        .replace(/{{renter.documentNumber}}/g, renter.documentNumber || '');
                }
                if (unit) {
                    content = content.replace(/{{unit.name}}/g, unit.name || '')
                        .replace(/{{unit.property.address}}/g, unit.propertyName || '');
                }
                const formattedRent = monthlyRent ? new Intl.NumberFormat('es-CO').format(monthlyRent) : '0';
                content = content.replace(/{{monthlyRent}}/g, `$${formattedRent}`);
                content = content.replace(/{{startDate}}/g, startDate || '');
                // endDate might not be ready in watch if calculated, but users can edit manually

                editor?.commands.setContent(content);
            }
        }
    }, [selectedTemplateId, selectedUnitId, selectedRenterId, monthlyRent, startDate, templates, editor, allUnits, renters]);

    const onSubmit = (data: CreateLeaseDto) => {
        const formattedData = {
            ...data,
            startDate: toUTC(new Date(`${data.startDate}T00:00:00`)),
            endDate: toUTC(new Date(`${data.endDate}T00:00:00`)),
            contractContent: creationMethod === 'template' ? editor?.getHTML() : undefined
        };

        createMutation.mutate(formattedData, {
            onSuccess: () => {
                reset();
                setDuration("12");
                setIsCreating(false);
                setCreationMethod('manual');
                setSelectedTemplateId("");
                editor?.commands.setContent("");
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

                            <div className="md:col-span-2 bg-indigo-50 p-4 rounded-lg border border-indigo-100 space-y-4">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="isExisting"
                                        {...register('isExisting')}
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                    />
                                    <label htmlFor="isExisting" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        ¿Es un contrato existente (migración)?
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500 ml-6">
                                    Marca esta opción si el contrato ya está en curso. Esto evitará generar cobros retroactivos.
                                </p>

                                {watch('isExisting') && (
                                    <FormField label="Fecha de Primer Cobro en Proppio" error={errors.firstPaymentDate?.message} required>
                                        <Input
                                            type="date"
                                            {...register('firstPaymentDate')}
                                            className={`bg-white ${errors.firstPaymentDate ? 'border-destructive' : ''}`}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            A partir de esta fecha se generarán los recibos automáticos. Meses anteriores no tendrán cobro.
                                        </p>
                                    </FormField>
                                )}
                            </div>

                            <FormField label={watch('isExisting') ? "Fecha Original de Inicio" : "Fecha Inicio"} error={errors.startDate?.message} required>
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
                                <Controller
                                    name="monthlyRent"
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                        <CurrencyInput
                                            value={value}
                                            onChange={onChange}
                                            placeholder="1.500.000"
                                            className={`bg-white ${errors.monthlyRent ? 'border-destructive' : ''}`}
                                        />
                                    )}
                                />
                            </FormField>
                            <FormField label="Depósito (Opcional)" error={errors.securityDeposit?.message}>
                                <Controller
                                    name="securityDeposit"
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                        <CurrencyInput
                                            value={value}
                                            onChange={onChange}
                                            placeholder="3.000.000"
                                            className={`bg-white ${errors.securityDeposit ? 'border-destructive' : ''}`}
                                        />
                                    )}
                                />
                            </FormField>

                            <div className="md:col-span-2 space-y-4 pt-4 border-t">
                                <label className="text-sm font-medium">Método de Generación de Contrato</label>
                                <div className="flex gap-4">
                                    <div className={`p-4 border rounded-lg cursor-pointer flex-1 transition-all ${creationMethod === 'manual' ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'hover:bg-gray-50 border-gray-200'}`} onClick={() => setCreationMethod('manual')}>
                                        <h4 className="font-medium text-gray-900">Subir PDF Manualmente</h4>
                                        <p className="text-sm text-gray-500 mt-1">Crear el contrato y subir el archivo PDF escaneado después.</p>
                                    </div>
                                    <div className={`p-4 border rounded-lg cursor-pointer flex-1 transition-all ${creationMethod === 'template' ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'hover:bg-gray-50 border-gray-200'}`} onClick={() => setCreationMethod('template')}>
                                        <h4 className="font-medium text-gray-900">Usar Plantilla</h4>
                                        <p className="text-sm text-gray-500 mt-1">Generar automáticamente desde una plantilla guardada.</p>
                                    </div>
                                </div>

                                {creationMethod === 'template' && (
                                    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                                        <FormField label="Seleccionar Plantilla">
                                            <select
                                                className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white"
                                                value={selectedTemplateId}
                                                onChange={(e) => setSelectedTemplateId(e.target.value)}
                                            >
                                                <option value="">Selecciona una plantilla...</option>
                                                {templates.map(t => (
                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                ))}
                                            </select>
                                        </FormField>

                                        <div className="border rounded-md p-2 bg-white min-h-[300px] shadow-inner">
                                            <EditorContent editor={editor} className="prose max-w-none focus:outline-none min-h-[300px] p-2" />
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            Revisa y edita el contenido generado arriba. Este será el documento final del contrato.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <div className="px-6 pb-6 flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => { reset(); setIsCreating(false); setCreationMethod('manual'); }}>Cancelar</Button>
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
