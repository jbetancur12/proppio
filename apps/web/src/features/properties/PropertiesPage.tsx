import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';
import { Plus, Search, Building2 } from 'lucide-react';
import { useProperties, useCreateProperty } from './hooks/useProperties';
import { PropertyCard } from './components/PropertyCard';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPropertySchema, CreatePropertyDto } from '@proppio/schemas';
import { FormField } from '@/components/forms/FormField';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

interface Property {
    id: string;
    name: string;
    address: string;
    units?: unknown[];
    alerts?: string[];
    occupancyRate?: number;
}

export function PropertiesPage() {
    const navigate = useNavigate();
    const [isCreating, setIsCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const { data: properties, isLoading } = useProperties();
    const createMutation = useCreateProperty();
    const debouncedSearch = useDebouncedValue(searchTerm, 300);

    // Form with validation
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<CreatePropertyDto>({
        resolver: zodResolver(createPropertySchema),
    });

    const onSubmit = (data: CreatePropertyDto) => {
        createMutation.mutate(data, {
            onSuccess: () => {
                reset();
                setIsCreating(false);
            },
        });
    };

    // Filter properties based on debounced search
    const filteredProperties = useMemo(() => {
        if (!properties) return [];
        if (!debouncedSearch) return properties;

        const searchLower = debouncedSearch.toLowerCase();
        return properties.filter(
            (p: Property) =>
                p.name?.toLowerCase().includes(searchLower) || p.address?.toLowerCase().includes(searchLower),
        );
    }, [properties, debouncedSearch]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Propiedades</h1>
                    <p className="text-gray-500">Gestiona tus inmuebles y unidades.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => setIsCreating(!isCreating)} className="bg-indigo-600 hover:bg-indigo-700">
                        <Plus size={18} className="mr-2" /> Agregar Propiedad
                    </Button>
                </div>
            </div>

            {/* Create Form */}
            {isCreating && (
                <Card className="animate-in fade-in slide-in-from-top-4 border-indigo-100 bg-indigo-50/50">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <CardHeader>
                            <CardTitle className="text-indigo-900">Nueva Propiedad</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Nombre" error={errors.name?.message} required>
                                <Input
                                    placeholder="Edificio Centro"
                                    {...register('name')}
                                    className={`bg-white ${errors.name ? 'border-destructive' : ''}`}
                                />
                            </FormField>
                            <FormField label="Dirección" error={errors.address?.message} required>
                                <Input
                                    placeholder="Calle 123 # 45-67"
                                    {...register('address')}
                                    className={`bg-white ${errors.address ? 'border-destructive' : ''}`}
                                />
                            </FormField>
                        </CardContent>
                        <div className="px-6 pb-6 flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    reset();
                                    setIsCreating(false);
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending ? 'Guardando...' : 'Crear Propiedad'}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">Todas las Propiedades</h2>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <Input
                            placeholder="Buscar propiedades..."
                            className="pl-9 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-40 bg-gray-100 animate-pulse rounded-xl"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProperties?.map((property: Property) => (
                            <PropertyCard
                                key={property.id}
                                property={property}
                                onClick={() => navigate(`/properties/${property.id}`)}
                            />
                        ))}
                        {filteredProperties?.length === 0 && (
                            <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                                    <Building2 size={24} />
                                </div>
                                <h3 className="font-medium text-gray-900">No hay propiedades registradas</h3>
                                <p className="text-sm text-gray-500 mt-1">Comienza agregando tu primera propiedad.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
