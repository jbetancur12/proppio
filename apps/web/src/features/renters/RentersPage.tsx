import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Plus, Search, User } from "lucide-react";
import { useRenters, useCreateRenter } from "./hooks/useRenters";
import { RenterCard } from "./components/RenterCard";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createRenterSchema, CreateRenterDto } from "@proppio/shared";
import { FormField } from "@/components/forms/FormField";

interface Renter {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone: string;
    identification: string;
}

/**
 * Container component - manages state and orchestrates data flow
 * Following design_guidelines.md section 3.1
 */
export function RentersPage() {
    const navigate = useNavigate();
    const [isCreating, setIsCreating] = useState(false);

    // Custom hooks extract logic from component (guideline 3.2)
    const { data: renters, isLoading } = useRenters();
    const createMutation = useCreateRenter();

    // Form with validation
    const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateRenterDto>({
        resolver: zodResolver(createRenterSchema)
    });

    const onSubmit = (data: CreateRenterDto) => {
        createMutation.mutate(data, {
            onSuccess: () => {
                reset();
                setIsCreating(false);
            }
        });
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
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <CardHeader>
                            <CardTitle className="text-indigo-900">Nuevo Inquilino</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Nombre" error={errors.firstName?.message} required>
                                <Input
                                    placeholder="Juan"
                                    {...register('firstName')}
                                    className={`bg-white ${errors.firstName ? 'border-destructive' : ''}`}
                                />
                            </FormField>
                            <FormField label="Apellido" error={errors.lastName?.message} required>
                                <Input
                                    placeholder="Pérez"
                                    {...register('lastName')}
                                    className={`bg-white ${errors.lastName ? 'border-destructive' : ''}`}
                                />
                            </FormField>
                            <FormField label="Email" error={errors.email?.message}>
                                <Input
                                    type="email"
                                    placeholder="juan@ejemplo.com"
                                    {...register('email')}
                                    className={`bg-white ${errors.email ? 'border-destructive' : ''}`}
                                />
                            </FormField>
                            <FormField label="Teléfono" error={errors.phone?.message} required>
                                <Input
                                    placeholder="+57 300 123 4567"
                                    {...register('phone')}
                                    className={`bg-white ${errors.phone ? 'border-destructive' : ''}`}
                                />
                            </FormField>
                            <FormField label="Identificación (CC/DNI)" error={errors.identification?.message} required className="md:col-span-2">
                                <Input
                                    placeholder="1234567890"
                                    {...register('identification')}
                                    className={`bg-white ${errors.identification ? 'border-destructive' : ''}`}
                                />
                            </FormField>
                        </CardContent>
                        <div className="px-6 pb-6 flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => { reset(); setIsCreating(false); }}>Cancelar</Button>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending ? 'Guardando...' : 'Crear Inquilino'}
                            </Button>
                        </div>
                    </form>
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
                        {renters?.map((renter: Renter) => (
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
