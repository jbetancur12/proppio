import { useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../api/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { toast } from "sonner"
import {
    Plus,
    Search,
    Building,
    MapPin,
    TrendingUp,
    Users,
} from "lucide-react"

export function DashboardPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [isCreating, setIsCreating] = useState(false) // Toggle for create modal/form

    // Create form state
    const [newName, setNewName] = useState("")
    const [newAddress, setNewAddress] = useState("")

    const { data: properties, isLoading } = useQuery({
        queryKey: ['properties'],
        queryFn: async () => {
            const res = await api.get('/api/properties');
            return res.data;
        }
    })

    const createMutation = useMutation({
        mutationFn: async () => {
            await api.post('/api/properties', { name: newName, address: newAddress });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['properties'] });
            setNewName("");
            setNewAddress("");
            setIsCreating(false);
            toast.success("Propiedad creada!");
        },
        onError: () => toast.error("Error al crear propiedad")
    })

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Panel de Control</h1>
                    <p className="text-gray-500">Resumen de tu portafolio inmobiliario.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => setIsCreating(!isCreating)} className="bg-indigo-600 hover:bg-indigo-700">
                        <Plus size={18} className="mr-2" /> Agregar Propiedad
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-indigo-100 font-medium">Total Propiedades</p>
                                <h3 className="text-3xl font-bold mt-1">{properties?.length || 0}</h3>
                            </div>
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm"><Building className="text-white" /></div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 font-medium">Total Inquilinos</p>
                                <h3 className="text-3xl font-bold mt-1 text-gray-900">0</h3>
                            </div>
                            <div className="p-3 bg-green-50 rounded-xl text-green-600"><Users /></div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 font-medium">Tasa de Ocupación</p>
                                <h3 className="text-3xl font-bold mt-1 text-gray-900">0%</h3>
                            </div>
                            <div className="p-3 bg-amber-50 rounded-xl text-amber-600"><TrendingUp /></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Create Form (Inline for now, could be dialog) */}
            {isCreating && (
                <Card className="animate-in fade-in slide-in-from-top-4 border-indigo-100 bg-indigo-50/50">
                    <CardHeader>
                        <CardTitle className="text-indigo-900">Agregar Nueva Propiedad</CardTitle>
                        <CardDescription>Ingresa los detalles del edificio o casa.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nombre Propiedad</label>
                            <Input placeholder="Ej. Apartamentos Pradera" value={newName} onChange={e => setNewName(e.target.value)} className="bg-white" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Dirección</label>
                            <Input placeholder="Calle 123 # 45-67" value={newAddress} onChange={e => setNewAddress(e.target.value)} className="bg-white" />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancelar</Button>
                        <Button onClick={() => createMutation.mutate()} disabled={!newName || createMutation.isPending}>
                            {createMutation.isPending ? 'Guardando...' : 'Crear Propiedad'}
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {/* Property Grid */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">Tus Propiedades</h2>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <Input placeholder="Buscar propiedades..." className="pl-9 bg-white" />
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-xl"></div>)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties?.map((p: any) => (
                            <Card
                                key={p.id}
                                className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border-gray-200"
                                onClick={() => navigate(`/properties/${p.id}`)}
                            >
                                <div className="h-40 bg-gray-100 relative group-hover:scale-105 transition-transform duration-500">
                                    {/* Placeholder generic image or gradient pattern */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-gray-200 to-gray-100 flex items-center justify-center text-gray-300">
                                        <Building size={48} />
                                    </div>
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                                        {p.units?.length || 0} Unidades
                                    </div>
                                </div>
                                <CardContent className="p-5">
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{p.name}</h3>
                                    <div className="flex items-start gap-2 mt-2 text-gray-500 text-sm">
                                        <MapPin size={16} className="mt-0.5 shrink-0" />
                                        {p.address}
                                    </div>
                                </CardContent>
                                <CardFooter className="p-5 pt-0 flex justify-between items-center text-sm text-gray-500 border-t border-gray-50 mt-4 pt-4">
                                    <span>Ocupación</span>
                                    <span className="font-medium text-gray-900">--%</span>
                                </CardFooter>
                            </Card>
                        ))}
                        {properties?.length === 0 && (
                            <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                                    <Building size={24} />
                                </div>
                                <h3 className="font-medium text-gray-900">No se encontraron propiedades</h3>
                                <p className="text-sm text-gray-500 mt-1">Comienza creando tu primera propiedad.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
