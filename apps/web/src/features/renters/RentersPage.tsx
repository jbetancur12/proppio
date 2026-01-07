import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Plus, Search, User } from "lucide-react";
import { useRenters, useCreateRenter } from "./hooks/useRenters";
import { RenterCard } from "./components/RenterCard";
import { useNavigate } from "react-router-dom";

/**
 * Container component - manages state and orchestrates data flow
 * Following design_guidelines.md section 3.1
 */
export function RentersPage() {
    const navigate = useNavigate();
    const [isCreating, setIsCreating] = useState(false);

    // Form state
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [identification, setIdentification] = useState("");

    // Custom hooks extract logic from component (guideline 3.2)
    const { data: renters, isLoading } = useRenters();
    const createMutation = useCreateRenter();

    const handleCreate = () => {
        createMutation.mutate(
            { firstName, lastName, email: email || undefined, phone, identification },
            {
                onSuccess: () => {
                    setFirstName("");
                    setLastName("");
                    setEmail("");
                    setPhone("");
                    setIdentification("");
                    setIsCreating(false);
                }
            }
        );
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Inquilinos</h1>
                    <p className="text-gray-500">Gestiona la información de tus arrendatarios.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => setIsCreating(!isCreating)} className="bg-indigo-600 hover:bg-indigo-700">
                        <Plus size={18} className="mr-2" /> Agregar Inquilino
                    </Button>
                </div>
            </div>

            {/* Create Form */}
            {isCreating && (
                <Card className="animate-in fade-in slide-in-from-top-4 border-indigo-100 bg-indigo-50/50">
                    <CardHeader>
                        <CardTitle className="text-indigo-900">Nuevo Inquilino</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nombre</label>
                            <Input placeholder="Juan" value={firstName} onChange={e => setFirstName(e.target.value)} className="bg-white" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Apellido</label>
                            <Input placeholder="Pérez" value={lastName} onChange={e => setLastName(e.target.value)} className="bg-white" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email (Opcional)</label>
                            <Input type="email" placeholder="juan@ejemplo.com" value={email} onChange={e => setEmail(e.target.value)} className="bg-white" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Teléfono</label>
                            <Input placeholder="+57 300 123 4567" value={phone} onChange={e => setPhone(e.target.value)} className="bg-white" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium">Identificación (CC/DNI)</label>
                            <Input placeholder="1234567890" value={identification} onChange={e => setIdentification(e.target.value)} className="bg-white" />
                        </div>
                    </CardContent>
                    <div className="px-6 pb-6 flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancelar</Button>
                        <Button
                            onClick={handleCreate}
                            disabled={!firstName || !lastName || !phone || !identification || createMutation.isPending}
                        >
                            {createMutation.isPending ? 'Guardando...' : 'Crear Inquilino'}
                        </Button>
                    </div>
                </Card>
            )}

            {/* Renters List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">Todos los Inquilinos</h2>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <Input placeholder="Buscar inquilinos..." className="pl-9 bg-white" />
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-100 animate-pulse rounded-xl"></div>)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {renters?.map((renter: any) => (
                            <RenterCard key={renter.id} renter={renter} onClick={() => navigate(`/renters/${renter.id}`)} />
                        ))}
                        {renters?.length === 0 && (
                            <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                                    <User size={24} />
                                </div>
                                <h3 className="font-medium text-gray-900">No hay inquilinos registrados</h3>
                                <p className="text-sm text-gray-500 mt-1">Comienza agregando tu primer inquilino.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
