import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRenterHistory, useUpdateRenter } from "./hooks/useRenters";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Mail, Phone, User, FileText, Pencil } from "lucide-react";
import { PaymentCard } from "../payments/components/PaymentCard";
import { TicketCard } from "../maintenance/components/TicketCard";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createRenterSchema, CreateRenterDto } from "@proppio/shared";
import { FormField } from "@/components/forms/FormField";

export function RenterDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: history, isLoading } = useRenterHistory(id!);
    const [isEditing, setIsEditing] = useState(false);
    const updateMutation = useUpdateRenter();
    const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateRenterDto>({
        resolver: zodResolver(createRenterSchema)
    });

    if (isLoading) return <div className="p-8 text-center text-gray-500">Cargando perfil...</div>;
    if (!history) return <div className="p-8 text-center text-red-500">Inquilino no encontrado</div>;

    const { renter, leases, payments, tickets } = history;

    // Reset form with current data when opening edit mode
    const handleEditClick = () => {
        if (history?.renter) {
            reset({
                firstName: history.renter.firstName,
                lastName: history.renter.lastName,
                email: history.renter.email,
                phone: history.renter.phone,
                identification: history.renter.identification
            });
            setIsEditing(true);
        }
    };

    const onUpdate = (data: CreateRenterDto) => {
        if (!id) return;
        updateMutation.mutate({ id, data }, {
            onSuccess: () => setIsEditing(false)
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Profile */}
            <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <Button variant="ghost" className="absolute top-4 left-4 md:static md:p-0" size="icon" onClick={() => navigate('/renters')}>
                    <ArrowLeft size={20} />
                </Button>

                <Avatar className="w-24 h-24 border-4 border-indigo-50">
                    <AvatarFallback className="text-2xl bg-indigo-100 text-indigo-700">
                        {renter.firstName[0]}{renter.lastName[0]}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center md:text-left space-y-2">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                        <h1 className="text-2xl font-bold text-gray-900">{renter.firstName} {renter.lastName}</h1>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600" onClick={handleEditClick}>
                            <Pencil size={16} />
                        </Button>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-3 text-gray-500 text-sm">
                        <span className="flex items-center gap-1"><User size={14} /> ID: {renter.identification}</span>
                        {renter.email && <span className="flex items-center gap-1"><Mail size={14} /> {renter.email}</span>}
                        <span className="flex items-center gap-1"><Phone size={14} /> {renter.phone}</span>
                    </div>
                </div>

                <div className="flex gap-4 text-center">
                    <div>
                        <p className="text-2xl font-bold text-indigo-600">{leases.length}</p>
                        <p className="text-xs text-gray-500 uppercase font-medium">Contratos</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-green-600">{payments.length}</p>
                        <p className="text-xs text-gray-500 uppercase font-medium">Pagos</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-orange-600">{tickets.length}</p>
                        <p className="text-xs text-gray-500 uppercase font-medium">Tickets</p>
                    </div>
                </div>
            </div>

            {/* Tabs Content */}
            <Tabs defaultValue="leases" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="leases">Contratos</TabsTrigger>
                    <TabsTrigger value="payments">Historial Pagos</TabsTrigger>
                    <TabsTrigger value="tickets">Mantenimiento</TabsTrigger>
                </TabsList>

                <TabsContent value="leases" className="space-y-4">
                    {leases.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">Sin contratos registrados</div>
                    ) : (
                        leases.map((lease: any) => (
                            <Card key={lease.id} className="hover:border-indigo-200 transition-colors cursor-pointer" onClick={() => navigate(`/leases/${lease.id}`)}>
                                <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{lease.unit?.property?.name} - {lease.unit?.name}</h3>
                                            <p className="text-sm text-gray-500">
                                                {new Date(lease.startDate).toLocaleDateString()} - {new Date(lease.endDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className={
                                            lease.status === 'ACTIVE' ? 'bg-green-50 text-green-700' :
                                                lease.status === 'EXPIRED' ? 'bg-red-50 text-red-700' :
                                                    'bg-gray-100'
                                        }>
                                            {lease.status}
                                        </Badge>
                                        <Button size="sm" variant="ghost">Ver Detalles</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                <TabsContent value="payments">
                    {payments.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">Sin pagos registrados</div>
                    ) : (
                        <div className="space-y-3">
                            {payments.map((payment: any) => (
                                <PaymentCard key={payment.id} payment={payment} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="tickets">
                    {tickets.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">Sin tickets reportados</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {tickets.map((ticket: any) => (
                                <TicketCard key={ticket.id} ticket={ticket} />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Edit Dialog */}
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Editar Inquilino</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onUpdate)} className="grid gap-4 py-4">
                        <FormField label="Nombre" error={errors.firstName?.message} required>
                            <Input {...register('firstName')} />
                        </FormField>
                        <FormField label="Apellido" error={errors.lastName?.message} required>
                            <Input {...register('lastName')} />
                        </FormField>
                        <FormField label="Email" error={errors.email?.message}>
                            <Input type="email" {...register('email')} />
                        </FormField>
                        <FormField label="Teléfono" error={errors.phone?.message} required>
                            <Input {...register('phone')} />
                        </FormField>
                        <FormField label="Identificación" error={errors.identification?.message} required>
                            <Input {...register('identification')} />
                        </FormField>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancelar</Button>
                            <Button type="submit" disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateRenterDto>({
    resolver: zodResolver(createRenterSchema)
});

// Reset form with current data when opening edit mode
const handleEditClick = () => {
    if (history?.renter) {
        reset({
            firstName: history.renter.firstName,
            lastName: history.renter.lastName,
            email: history.renter.email,
            phone: history.renter.phone,
            identification: history.renter.identification
        });
        setIsEditing(true);
    }
};

const onUpdate = (data: CreateRenterDto) => {
    if (!id) return;
    updateMutation.mutate({ id, data }, {
        onSuccess: () => setIsEditing(false)
    });
};

return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header / Profile */}
        <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-white rounded-xl shadow-sm border border-gray-100 relative">
            <Button variant="ghost" className="absolute top-4 left-4 md:static md:p-0" size="icon" onClick={() => navigate('/renters')}>
                <ArrowLeft size={20} />
            </Button>

            <Avatar className="w-24 h-24 border-4 border-indigo-50">
                <AvatarFallback className="text-2xl bg-indigo-100 text-indigo-700">
                    {renter.firstName[0]}{renter.lastName[0]}
                </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left space-y-2">
                <div className="flex items-center justify-center md:justify-start gap-2">
                    <h1 className="text-2xl font-bold text-gray-900">{renter.firstName} {renter.lastName}</h1>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600" onClick={handleEditClick}>
                        <Pencil size={16} />
                    </Button>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-3 text-gray-500 text-sm">
                    <span className="flex items-center gap-1"><User size={14} /> ID: {renter.identification}</span>
                    {renter.email && <span className="flex items-center gap-1"><Mail size={14} /> {renter.email}</span>}
                    <span className="flex items-center gap-1"><Phone size={14} /> {renter.phone}</span>
                </div>
            </div>

            <div className="flex gap-4 text-center">
                <div>
                    <p className="text-2xl font-bold text-indigo-600">{leases.length}</p>
                    <p className="text-xs text-gray-500 uppercase font-medium">Contratos</p>
                </div>
                <div>
                    <p className="text-2xl font-bold text-green-600">{payments.length}</p>
                    <p className="text-xs text-gray-500 uppercase font-medium">Pagos</p>
                </div>
                <div>
                    <p className="text-2xl font-bold text-orange-600">{tickets.length}</p>
                    <p className="text-xs text-gray-500 uppercase font-medium">Tickets</p>
                </div>
            </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Inquilino</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onUpdate)} className="grid gap-4 py-4">
                    <FormField label="Nombre" error={errors.firstName?.message} required>
                        <Input {...register('firstName')} />
                    </FormField>
                    <FormField label="Apellido" error={errors.lastName?.message} required>
                        <Input {...register('lastName')} />
                    </FormField>
                    <FormField label="Email" error={errors.email?.message}>
                        <Input type="email" {...register('email')} />
                    </FormField>
                    <FormField label="Teléfono" error={errors.phone?.message} required>
                        <Input {...register('phone')} />
                    </FormField>
                    <FormField label="Identificación" error={errors.identification?.message} required>
                        <Input {...register('identification')} />
                    </FormField>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancelar</Button>
                        <Button type="submit" disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
