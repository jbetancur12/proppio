import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { ArrowLeft, Home, User, Settings, BedDouble, Bath, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProperty, useUnits, useCreateUnit } from "./hooks/useProperties";

/**
 * Container component for Property Details
 * Following design_guidelines.md section 3.1
 */
export function PropertyDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [unitName, setUnitName] = useState("");
    const [unitType, setUnitType] = useState("");
    const [activeTab, setActiveTab] = useState("units");

    const { data: property, isLoading: loadingProp } = useProperty(id || "");
    const { data: units, isLoading: loadingUnits } = useUnits(id || "");
    const createUnitMutation = useCreateUnit(id || "");

    const handleCreateUnit = () => {
        createUnitMutation.mutate(
            { propertyId: id!, name: unitName, type: unitType || "Apartamento" },
            { onSuccess: () => setUnitName("") }
        );
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
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8" aria-label="Tabs">
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
                                    {units?.map((u: any) => (
                                        <Card key={u.id} className={`hover:border-indigo-300 transition-colors group ${u.activeLease ? 'border-green-100 bg-green-50/20' : ''}`}>
                                            <CardContent className="p-4 flex justify-between items-center">
                                                <div>
                                                    <h4 className="font-bold text-lg text-gray-800 group-hover:text-indigo-600">{u.name}</h4>
                                                    <p className="text-sm text-gray-500 capitalize">{u.type || "Apartamento"}</p>
                                                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                                        <span className="flex items-center gap-1"><BedDouble size={12} /> 2</span>
                                                        <span className="flex items-center gap-1"><Bath size={12} /> 1</span>
                                                        <span>{u.area ? `${u.area} m²` : '-- m²'}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    {u.activeLease ? (
                                                        <div className="space-y-1">
                                                            <div className="h-2 w-2 rounded-full bg-green-500 ml-auto" title="Ocupado"></div>
                                                            <div
                                                                className="text-xs font-semibold text-indigo-600 cursor-pointer hover:underline flex items-center justify-end gap-1"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/leases/${u.activeLease.id}`);
                                                                }}
                                                            >
                                                                <User size={10} />
                                                                {u.activeLease.renterName.split(' ')[0]}
                                                            </div>
                                                        </div>
                                                    ) : (
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
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {units?.length === 0 && <p className="text-gray-500 col-span-2">Sin unidades aún.</p>}
                                </div>
                            )}
                        </div>

                        <div>
                            <Card className="sticky top-4">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Plus size={18} /> Agregar Unidad</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase text-gray-500">Número / Nombre</label>
                                        <Input placeholder="Ej. 101" value={unitName} onChange={e => setUnitName(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase text-gray-500">Tipo</label>
                                        <Input placeholder="Ej. Apartamento" value={unitType} onChange={e => setUnitType(e.target.value)} />
                                    </div>
                                    <Button className="w-full bg-gray-900 text-white hover:bg-black" onClick={handleCreateUnit} disabled={!unitName}>
                                        Crear Unidad
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'overview' && (
                    <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed">
                        Estadísticas próximamente...
                    </div>
                )}
                {activeTab === 'tenants' && (
                    <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed">
                        Gestión de inquilinos próximamente...
                    </div>
                )}
                {activeTab === 'settings' && (
                    <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed">
                        Configuración de propiedad próximamente...
                    </div>
                )}
            </div>
        </div>
    );
}
