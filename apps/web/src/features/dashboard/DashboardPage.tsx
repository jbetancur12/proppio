import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Plus, Search, Building, TrendingUp, Users, DollarSign, FileText, AlertTriangle, ArrowRight } from "lucide-react"
import { useProperties, useCreateProperty } from "../properties/hooks/useProperties"
import { PropertyCard } from "../properties/components/PropertyCard"
import { useDashboardStats, useFinancialHistory } from "./hooks/useDashboardStats"
import { useExpiringLeases } from "../leases/hooks/useLeases"
import { FinancialChart } from "./components/FinancialChart"

/**
 * Dashboard - Container component
 * Uses hooks for data fetching following design_guidelines.md 3.2
 */
export function DashboardPage() {
    const navigate = useNavigate()
    const [isCreating, setIsCreating] = useState(false)
    const [newName, setNewName] = useState("")
    const [newAddress, setNewAddress] = useState("")

    const { data: properties, isLoading } = useProperties()
    const { data: stats } = useDashboardStats()
    const { data: financialHistory } = useFinancialHistory()
    const { data: expiringLeases } = useExpiringLeases(60)
    const createMutation = useCreateProperty()

    const handleCreate = () => {
        createMutation.mutate(
            { name: newName, address: newAddress },
            {
                onSuccess: () => {
                    setNewName("")
                    setNewAddress("")
                    setIsCreating(false)
                }
            }
        )
    }

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);

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

            {/* Expiring Leases Alert (Only if any) */}
            {expiringLeases && expiringLeases.length > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-amber-800 font-bold">
                            <AlertTriangle size={20} className="text-amber-600" />
                            <h3>Próximos Vencimientos de Contratos (60 días)</h3>
                        </div>
                        <Button variant="ghost" size="sm" className="text-amber-700 hover:text-amber-900" onClick={() => navigate('/leases')}>
                            Ver Todos <ArrowRight size={16} className="ml-1" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {expiringLeases.slice(0, 3).map((lease: any) => {
                            const daysLeft = Math.ceil((new Date(lease.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                            const isUrgent = daysLeft <= 30;
                            return (
                                <div key={lease.id} className="bg-white p-3 rounded-lg border border-amber-100 shadow-sm flex justify-between items-center group cursor-pointer hover:border-amber-300 transition-all" onClick={() => navigate('/leases')}>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">{lease.unit?.name}</p>
                                        <p className="text-xs text-gray-500">{lease.renter?.firstName} {lease.renter?.lastName}</p>
                                    </div>
                                    <div className={`text-xs font-bold px-2 py-1 rounded ${isUrgent ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {daysLeft} días
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Stats Overview - Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-indigo-100 font-medium text-sm">Propiedades</p>
                                <h3 className="text-2xl font-bold mt-1">{stats?.totalProperties || 0}</h3>
                            </div>
                            <div className="p-2.5 bg-white/20 rounded-lg backdrop-blur-sm"><Building className="text-white" size={20} /></div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-emerald-100 font-medium text-sm">Ocupación</p>
                                <h3 className="text-2xl font-bold mt-1">{stats?.occupancyRate || 0}%</h3>
                                <p className="text-xs text-emerald-200 mt-1">{stats?.occupiedUnits || 0}/{stats?.totalUnits || 0} unidades</p>
                            </div>
                            <div className="p-2.5 bg-white/20 rounded-lg backdrop-blur-sm"><TrendingUp className="text-white" size={20} /></div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 font-medium text-sm">Inquilinos</p>
                                <h3 className="text-2xl font-bold mt-1 text-gray-900">{stats?.totalRenters || 0}</h3>
                            </div>
                            <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600"><Users size={20} /></div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 font-medium text-sm">Contratos Activos</p>
                                <h3 className="text-2xl font-bold mt-1 text-gray-900">{stats?.activeLeases || 0}</h3>
                            </div>
                            <div className="p-2.5 bg-purple-50 rounded-lg text-purple-600"><FileText size={20} /></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Stats Overview - Row 2 (Financial) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-none shadow-sm">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 font-medium text-sm">Ingresos (Mes)</p>
                                <h3 className="text-xl font-bold mt-1 text-green-600">{formatCurrency(stats?.monthlyReceivedIncome || 0)}</h3>
                                <p className="text-xs text-gray-400 mt-1">Esperado: {formatCurrency(stats?.monthlyExpectedIncome || 0)}</p>
                            </div>
                            <div className="p-2.5 bg-green-50 rounded-lg text-green-600"><DollarSign size={20} /></div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 font-medium text-sm">Gastos (Mes)</p>
                                <h3 className="text-xl font-bold mt-1 text-red-600">-{formatCurrency(stats?.monthlyExpenses || 0)}</h3>
                            </div>
                            <div className="p-2.5 bg-red-50 rounded-lg text-red-600"><TrendingUp className="rotate-180" size={20} /></div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-50 to-white border-indigo-100 border">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-indigo-600 font-medium text-sm">Utilidad Neta</p>
                                <h3 className="text-xl font-bold mt-1 text-indigo-700">{formatCurrency(stats?.netIncome || 0)}</h3>
                            </div>
                            <div className="p-2.5 bg-indigo-100 rounded-lg text-indigo-600"><DollarSign size={20} /></div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 font-medium text-sm">Tasa de Recaudo</p>
                                <h3 className={`text-xl font-bold mt-1 ${(stats?.collectionRate || 0) >= 80 ? 'text-green-600' : 'text-amber-600'}`}>
                                    {stats?.collectionRate || 0}%
                                </h3>
                            </div>
                            <div className={`p-2.5 rounded-lg ${(stats?.collectionRate || 0) >= 80 ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                <TrendingUp size={20} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Financial History Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <FinancialChart data={financialHistory} />

                {/* Add Quick Actions or Recent Activity here later if needed */}
            </div>

            {/* Create Form */}
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
                        <Button onClick={handleCreate} disabled={!newName || createMutation.isPending}>
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
                            <PropertyCard
                                key={p.id}
                                property={p}
                                onClick={() => navigate(`/properties/${p.id}`)}
                            />
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
