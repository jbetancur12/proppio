import { useState } from "react";
import { Plus, Hammer, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useMaintenanceTickets, useCreateTicket } from "./hooks/useMaintenance";
import { TicketCard } from "./components/TicketCard";
import { useProperties } from "../properties/hooks/useProperties";

export function MaintenancePage() {
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const { data: tickets, isLoading } = useMaintenanceTickets({ status: statusFilter !== 'ALL' ? statusFilter : undefined });
    const { data: properties } = useProperties();
    const createMutation = useCreateTicket();

    // Form State
    const [newTicket, setNewTicket] = useState({
        title: '',
        description: '',
        unitId: '',
        priority: 'MEDIUM',
    });

    // Flatten units for selection
    const allUnits = properties?.flatMap((p: any) => p.units.map((u: any) => ({ ...u, propertyName: p.name }))) || [];

    const handleCreate = () => {
        createMutation.mutate(newTicket, {
            onSuccess: () => {
                setIsCreateOpen(false);
                setNewTicket({ title: '', description: '', unitId: '', priority: 'MEDIUM' });
            }
        });
    };

    const filteredTickets = tickets?.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.unit.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                        <Hammer className="text-indigo-600" /> Mantenimiento & Tickets
                    </h1>
                    <p className="text-gray-500">Gestiona reparaciones e incidencias de tus propiedades</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-indigo-600 hover:bg-indigo-700">
                            <Plus size={16} className="mr-2" /> Nuevo Reporte
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Crear Ticket de Mantenimiento</DialogTitle>
                            <DialogDescription>
                                Reporta un daño o solicitud de reparación para una unidad.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Título</Label>
                                <Input
                                    id="title"
                                    placeholder="Ej: Gotera en baño principal"
                                    value={newTicket.title}
                                    onChange={e => setNewTicket({ ...newTicket, title: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="unit">Unidad Afectada</Label>
                                <Select onValueChange={val => setNewTicket({ ...newTicket, unitId: val })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar Unidad" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allUnits.map((u: any) => (
                                            <SelectItem key={u.id} value={u.id}>
                                                {u.propertyName} - {u.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="priority">Prioridad</Label>
                                <Select defaultValue="MEDIUM" onValueChange={val => setNewTicket({ ...newTicket, priority: val })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar Prioridad" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LOW">Baja (Puede esperar)</SelectItem>
                                        <SelectItem value="MEDIUM">Media (Estándar)</SelectItem>
                                        <SelectItem value="HIGH">Alta (Importante)</SelectItem>
                                        <SelectItem value="URGENT">Urgente (Inmediata)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="desc">Descripción Detallada</Label>
                                <Textarea
                                    id="desc"
                                    placeholder="Describe el problema con detalle..."
                                    className="h-24"
                                    value={newTicket.description}
                                    onChange={e => setNewTicket({ ...newTicket, description: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                            <Button onClick={handleCreate} disabled={createMutation.isPending}>
                                {createMutation.isPending ? 'Creando...' : 'Crear Ticket'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Buscar por título o unidad..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Todos los estados</SelectItem>
                        <SelectItem value="OPEN">Abiertos</SelectItem>
                        <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                        <SelectItem value="RESOLVED">Resueltos</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-100 animate-pulse rounded-lg" />)}
                </div>
            ) : filteredTickets?.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-100 shadow-sm">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Hammer className="text-gray-400" size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Sin tickets de mantenimiento</h3>
                    <p className="text-gray-500 mt-1">No hay reportes que coincidan con tus filtros.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTickets?.map(ticket => (
                        <TicketCard key={ticket.id} ticket={ticket} />
                    ))}
                </div>
            )}
        </div>
    );
}
