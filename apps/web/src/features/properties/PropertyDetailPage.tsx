import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { ArrowLeft, Home, User, Settings, BedDouble, Bath, Plus, Trash2, Edit, Wallet, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProperty, useUnits, useCreateUnit, useUpdateProperty, useDeleteProperty, useUpdateUnit, useDeleteUnit } from "./hooks/useProperties";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PropertyOverviewTab } from "./components/PropertyOverviewTab";
import { PropertyTenantsTab } from "./components/PropertyTenantsTab";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUnitSchema, CreateUnitDto, UpdatePropertyDto, updatePropertySchema } from '@proppio/schemas';
import { FormField } from "@/components/forms/FormField";

interface Unit {
    id: string;
    name: string;
    type?: string;
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    baseRent?: number;
    status?: 'VACANT' | 'OCCUPIED' | 'MAINTENANCE';
    activeLease?: {
        id: string;
        renterName: string;
    };
    alerts?: string[];
}

/**
 * Container component for Property Details
 * Following design_guidelines.md section 3.1
 */
export function PropertyDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
    const [activeTab, setActiveTab] = useState("units");

    const { data: property, isLoading: loadingProp } = useProperty(id || "");
    const { data: units, isLoading: loadingUnits } = useUnits(id || "");
    const createUnitMutation = useCreateUnit(id || "");
    const updateUnitMutation = useUpdateUnit(id || "");
    const deleteUnitMutation = useDeleteUnit(id || "");
    const updatePropertyMutation = useUpdateProperty();
    const deletePropertyMutation = useDeleteProperty();

    // Unit form with validation
    const { register: registerUnit, handleSubmit: handleSubmitUnit, formState: { errors: unitErrors }, reset: resetUnit } = useForm<CreateUnitDto>({
        resolver: zodResolver(createUnitSchema),
        defaultValues: {
            propertyId: id || ""
        }
    });

    const onSubmitUnit = (data: CreateUnitDto) => {
        createUnitMutation.mutate({
            ...data,
            type: data.type || "Apartamento" // Ensure type always has a value
        }, {
            onSuccess: () => {
                resetUnit({ propertyId: id || "" });
            }
        });
    };

    if (loadingProp) return <div className="p-8">Cargando...</div>;
    if (!property) return <div className="p-8">Propiedad no encontrada <Button onClick={() => navigate('/dashboard')}>Volver</Button></div>;

    return (
        <div className="space-y-6">
            {/* Navigation & Header */}
            <div className="flex items-center gap-4 text-gray-500 mb-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="hover:bg-gray-100">
                    <ArrowLeft size={16} className="mr-2" /> Volver
                </Button>
                <span>/</span>
                <span className="text-gray-900 font-medium">{property.name}</span>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{property.name}</h1>
                    <p className="text-gray-500 mt-1 flex items-center gap-2">
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide">Activo</span>
                        {property.address}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Editar</Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700">Nuevo Contrato</Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 overflow-x-auto">
                <nav className="flex space-x-8 min-w-max px-2" aria-label="Tabs">
                    {[
                        { id: 'overview', label: 'Resumen', icon: Home },
                        { id: 'units', label: 'Unidades', icon: BedDouble },
                        { id: 'tenants', label: 'Inquilinos', icon: User },
                        { id: 'settings', label: 'Configuración', icon: Settings },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                                    activeTab === tab.id
                                        ? "border-indigo-500 text-indigo-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                )}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        )
                    })}
                </nav>
            </div>

            {/* Content */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {activeTab === 'units' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold">Todas las Unidades</h3>
                                <span className="text-sm text-gray-500">{units?.length || 0} unidades total</span>
                            </div>

                            {loadingUnits ? <p>Cargando...</p> : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {units?.map((u: Unit) => (
                                        <Card key={u.id} className={`hover:border-indigo-300 transition-colors group ${u.activeLease ? 'border-green-100 bg-green-50/20' : ''}`}>
                                            <CardContent className="p-4 flex justify-between items-center">
                                                <div>
                                                    <h4 className="font-bold text-lg text-gray-800 group-hover:text-indigo-600">{u.name}</h4>
                                                    <p className="text-sm text-gray-500 capitalize">{u.type || "Apartamento"}</p>
                                                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                                        <span className="flex items-center gap-1"><BedDouble size={12} /> {u.bedrooms || '--'}</span>
                                                        <span className="flex items-center gap-1"><Bath size={12} /> {u.bathrooms || '--'}</span>
                                                        <span>{u.area ? `${u.area} m²` : '-- m²'}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right flex flex-col items-end gap-2">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {(u.activeLease || u.status === 'OCCUPIED') && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none shadow-none">Ocupado</Badge>}
                                                        {(!u.activeLease && u.status === 'MAINTENANCE') && <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none shadow-none">Mantenimiento</Badge>}
                                                        {(!u.activeLease && (!u.status || u.status === 'VACANT')) && <Badge variant="outline" className="text-gray-500 border-gray-200">Vacante</Badge>}

                                                        {/* Alerts */}
                                                        {u.alerts?.includes('PENDING_PAYMENTS') && (
                                                            <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none shadow-none flex gap-1 px-1.5">
                                                                <Wallet size={10} /> Pagos
                                                            </Badge>
                                                        )}
                                                        {u.alerts?.includes('EXPIRING_LEASE') && (
                                                            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none shadow-none flex gap-1 px-1.5">
                                                                <Clock size={10} /> Vence
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    {u.activeLease ? (
                                                        <div className="space-y-1 text-right">
                                                            <div className="h-2 w-2 rounded-full bg-green-500 ml-auto" title="Ocupado"></div>
                                                            <div
                                                                className="text-xs font-semibold text-indigo-600 cursor-pointer hover:underline flex items-center justify-end gap-1"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/leases/${u.activeLease!.id}`);
                                                                }}
                                                            >
                                                                <User size={10} />
                                                                {u.activeLease.renterName.split(' ')[0]}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-7 w-7 text-gray-400 hover:text-blue-600"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setEditingUnit(u);
                                                                }}
                                                            >
                                                                <Edit size={14} />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-7 w-7 text-gray-400 hover:text-red-600"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (confirm("¿Eliminar unidad?")) {
                                                                        deleteUnitMutation.mutate(u.id);
                                                                    }
                                                                }}
                                                            >
                                                                <Trash2 size={14} />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-7 text-xs border-dashed border-gray-400 text-gray-500 hover:text-indigo-600 hover:border-indigo-600 hover:bg-indigo-50"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/leases?create=true&unitId=${u.id}`);
                                                                }}
                                                            >
                                                                <Plus size={12} className="mr-1" /> Asignar
                                                            </Button>
                                                        </div>
                                                    )}
                                                    <div className="text-xs font-medium text-gray-500">
                                                        {u.baseRent ? `$${u.baseRent.toLocaleString()}` : <span className="text-gray-300">Sin precio</span>}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {units?.length === 0 && <p className="text-gray-500 col-span-2">Sin unidades aún.</p>}
                                </div>
                            )}

                            {/* Edit Unit Dialog */}
                            <Dialog open={!!editingUnit} onOpenChange={(open) => !open && setEditingUnit(null)}>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Editar Unidad</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Nombre / Número</label>
                                            <Input defaultValue={editingUnit?.name} onChange={e => setEditingUnit(prev => prev ? { ...prev, name: e.target.value } as Unit : null)} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Habitaciones</label>
                                                <Input type="number" defaultValue={editingUnit?.bedrooms} onChange={e => setEditingUnit(prev => prev ? { ...prev, bedrooms: parseInt(e.target.value) } as Unit : null)} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Baños</label>
                                                <Input type="number" defaultValue={editingUnit?.bathrooms} onChange={e => setEditingUnit(prev => prev ? { ...prev, bathrooms: parseInt(e.target.value) } as Unit : null)} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Área (m²)</label>
                                                <Input type="number" defaultValue={editingUnit?.area} onChange={e => setEditingUnit(prev => prev ? { ...prev, area: parseFloat(e.target.value) } as Unit : null)} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Canon Base</label>
                                                <Input type="number" defaultValue={editingUnit?.baseRent} onChange={e => setEditingUnit(prev => prev ? { ...prev, baseRent: parseFloat(e.target.value) } as Unit : null)} />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Estado</label>
                                            <Select
                                                value={editingUnit?.status || 'VACANT'}
                                                onValueChange={(val) => setEditingUnit(prev => prev ? { ...prev, status: val as 'VACANT' | 'OCCUPIED' | 'MAINTENANCE' } as Unit : null)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar estado" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="VACANT">Vacante</SelectItem>
                                                    <SelectItem value="OCCUPIED">Ocupado</SelectItem>
                                                    <SelectItem value="MAINTENANCE">Mantenimiento</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setEditingUnit(null)}>Cancelar</Button>
                                        <Button onClick={() => {
                                            if (editingUnit) {
                                                // Using any for data to avoid strict strict DTO mismatch with Unit interface extra props
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                updateUnitMutation.mutate({ id: editingUnit.id, data: editingUnit as any }, {
                                                    onSuccess: () => setEditingUnit(null)
                                                });
                                            }
                                        }}>Guardar Cambios</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div>
                            <Card className="sticky top-4">
                                <form onSubmit={handleSubmitUnit(onSubmitUnit)}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><Plus size={18} /> Agregar Unidad</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField label="Número / Nombre" error={unitErrors.name?.message} required>
                                            <Input
                                                placeholder="Ej. 101"
                                                {...registerUnit('name')}
                                                className={unitErrors.name ? 'border-destructive' : ''}
                                            />
                                        </FormField>
                                        <FormField label="Tipo" error={unitErrors.type?.message}>
                                            <Input
                                                placeholder="Ej. Apartamento"
                                                {...registerUnit('type')}
                                                className={unitErrors.type ? 'border-destructive' : ''}
                                            />
                                        </FormField>
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField label="Habitaciones" error={unitErrors.bedrooms?.message}>
                                                <Input
                                                    type="number"
                                                    placeholder="2"
                                                    {...registerUnit('bedrooms', { valueAsNumber: true })}
                                                    className={unitErrors.bedrooms ? 'border-destructive' : ''}
                                                />
                                            </FormField>
                                            <FormField label="Baños" error={unitErrors.bathrooms?.message}>
                                                <Input
                                                    type="number"
                                                    placeholder="1"
                                                    {...registerUnit('bathrooms', { valueAsNumber: true })}
                                                    className={unitErrors.bathrooms ? 'border-destructive' : ''}
                                                />
                                            </FormField>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField label="Área (m²)" error={unitErrors.area?.message}>
                                                <Input
                                                    type="number"
                                                    placeholder="65"
                                                    {...registerUnit('area', { valueAsNumber: true })}
                                                    className={unitErrors.area ? 'border-destructive' : ''}
                                                />
                                            </FormField>
                                            <FormField label="Canon Base" error={unitErrors.baseRent?.message}>
                                                <Input
                                                    type="number"
                                                    placeholder="$"
                                                    {...registerUnit('baseRent', { valueAsNumber: true })}
                                                    className={unitErrors.baseRent ? 'border-destructive' : ''}
                                                />
                                            </FormField>
                                        </div>
                                        <Button type="submit" className="w-full bg-gray-900 text-white hover:bg-black" disabled={createUnitMutation.isPending}>
                                            {createUnitMutation.isPending ? 'Creando...' : 'Crear Unidad'}
                                        </Button>
                                    </CardContent>
                                </form>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'overview' && (
                    <PropertyOverviewTab propertyId={id!} />
                )}
                {activeTab === 'tenants' && (
                    <PropertyTenantsTab propertyId={id!} />
                )}
                {activeTab === 'settings' && (
                    <div className="space-y-6 max-w-2xl mx-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle>Información de la Propiedad</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Nombre de la Propiedad</label>
                                    <Input
                                        defaultValue={property.name}
                                        onBlur={(e) => updatePropertyMutation.mutate({ id: property.id, data: { ...property, name: e.target.value } })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Dirección</label>
                                    <Input
                                        defaultValue={property.address}
                                        onBlur={(e) => updatePropertyMutation.mutate({ id: property.id, data: { ...property, address: e.target.value } })}
                                    />
                                </div>
                                <p className="text-sm text-gray-500 italic">
                                    Los cambios se guardan automáticamente al salir del campo.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-red-100 bg-red-50/20">
                            <CardHeader>
                                <CardTitle className="text-red-700">Zona de Peligro</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-gray-600">
                                    Si eliminas esta propiedad, se perderá toda la información asociada, incluyendo unidades y contratos activos. Esta acción no se puede deshacer.
                                </p>
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        if (confirm("¿Estás seguro de que quieres eliminar esta propiedad? Esta acción es irreversible.")) {
                                            deletePropertyMutation.mutate(property.id, {
                                                onSuccess: () => navigate('/properties')
                                            });
                                        }
                                    }}
                                >
                                    Eliminar Propiedad
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
