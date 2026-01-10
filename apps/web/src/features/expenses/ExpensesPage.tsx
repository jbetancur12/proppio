import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useExpenses, useCreateExpense } from "./hooks/useExpenses";
import { ExpenseCard } from "./components/ExpenseCard";
import { useProperties } from "../properties/hooks/useProperties";

export function ExpensesPage() {
    const [isCreating, setIsCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        propertyId: "",
        description: "",
        amount: "" as string | number,
        date: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0],
        category: "MAINTENANCE",
        supplier: "",
        invoiceNumber: ""
    });

    const { data: expenses, isLoading } = useExpenses();
    const { data: properties } = useProperties();
    const createMutation = useCreateExpense();

    const handleSubmit = () => {
        createMutation.mutate({
            ...formData,
            amount: Number(formData.amount),
            status: 'PAID'
        }, {
            onSuccess: () => {
                setIsCreating(false);
                setFormData({ ...formData, description: "", amount: "", supplier: "", invoiceNumber: "" });
            }
        });
    };

    const filteredExpenses = expenses?.filter(e =>
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.property.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalExpenses = filteredExpenses?.reduce((sum, e) => sum + e.amount, 0) || 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gastos</h1>
                    <p className="text-gray-500">Registro de mantenimientos, reparaciones y servicios.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Card className="bg-red-50 border-red-100 px-4 py-2">
                        <span className="text-xs text-red-600 font-bold uppercase block">Total Gastos</span>
                        <span className="text-lg font-bold text-red-700">
                            {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(totalExpenses)}
                        </span>
                    </Card>
                    <Button onClick={() => setIsCreating(!isCreating)} className="bg-indigo-600 hover:bg-indigo-700">
                        <Plus size={18} className="mr-2" /> Registrar Gasto
                    </Button>
                </div>
            </div>

            {isCreating && (
                <Card className="animate-in fade-in slide-in-from-top-4 border-indigo-100 bg-indigo-50/50">
                    <CardHeader>
                        <CardTitle className="text-indigo-900">Nuevo Gasto</CardTitle>
                        <CardDescription>Detalles de la transacción.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Propiedad *</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.propertyId}
                                onChange={e => setFormData({ ...formData, propertyId: e.target.value })}
                            >
                                <option value="">Seleccionar Propiedad</option>
                                {properties?.map((p: any) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Categoría *</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="MAINTENANCE">Mantenimiento</option>
                                <option value="REPAIRS">Reparaciones</option>
                                <option value="UTILITIES">Servicios Públicos</option>
                                <option value="TAXES">Impuestos</option>
                                <option value="MANAGEMENT">Administración</option>
                                <option value="INSURANCE">Seguros</option>
                                <option value="OTHER">Otro</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Descripción *</label>
                            <Input
                                placeholder="Ej. Pintura apto 201"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Monto *</label>
                            <CurrencyInput
                                value={typeof formData.amount === 'number' ? formData.amount : undefined}
                                onChange={(val) => setFormData({ ...formData, amount: val })}
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Fecha *</label>
                            <Input
                                type="date"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Proveedor (Opcional)</label>
                            <Input
                                placeholder="Ej. Ferretería El Clavo"
                                value={formData.supplier}
                                onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancelar</Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!formData.propertyId || !formData.amount || !formData.description || createMutation.isPending}
                        >
                            {createMutation.isPending ? 'Guardando...' : 'Registrar Gasto'}
                        </Button>
                    </CardFooter>
                </Card>
            )}

            <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Buscar por descripción o propiedad..."
                        className="pl-10 border-none bg-gray-50"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="icon">
                    <Filter size={18} />
                </Button>
            </div>

            <div className="space-y-3">
                {isLoading ? (
                    <div className="text-center py-12 text-gray-400">Cargando gastos...</div>
                ) : filteredExpenses?.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-200">
                        <p className="text-gray-500">No hay gastos registrados</p>
                    </div>
                ) : (
                    filteredExpenses?.map(expense => (
                        <ExpenseCard key={expense.id} expense={expense} />
                    ))
                )}
            </div>
        </div>
    );
}
