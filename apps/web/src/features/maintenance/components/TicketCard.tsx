import { MaintenanceTicket, TicketStatus, TicketPriority } from "../services/maintenanceApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Clock, Hammer, User } from "lucide-react";
import { useUpdateTicketStatus } from "../hooks/useMaintenance";

const statusConfig = {
    [TicketStatus.OPEN]: { label: 'Abierto', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
    [TicketStatus.IN_PROGRESS]: { label: 'En Progreso', color: 'bg-blue-100 text-blue-700', icon: Clock },
    [TicketStatus.RESOLVED]: { label: 'Resuelto', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    [TicketStatus.CLOSED]: { label: 'Cerrado', color: 'bg-gray-100 text-gray-700', icon: CheckCircle },
};

const priorityConfig = {
    [TicketPriority.LOW]: { label: 'Baja', color: 'bg-gray-100 text-gray-700' },
    [TicketPriority.MEDIUM]: { label: 'Media', color: 'bg-blue-50 text-blue-700' },
    [TicketPriority.HIGH]: { label: 'Alta', color: 'bg-orange-50 text-orange-700' },
    [TicketPriority.URGENT]: { label: 'Urgente', color: 'bg-red-50 text-red-700 border-red-200' },
};

export function TicketCard({ ticket }: { ticket: MaintenanceTicket }) {
    const updateStatus = useUpdateTicketStatus();

    const StatusIcon = statusConfig[ticket.status].icon;
    const priority = priorityConfig[ticket.priority];

    const handleAdvance = () => {
        if (ticket.status === TicketStatus.OPEN) {
            updateStatus.mutate({ id: ticket.id, status: TicketStatus.IN_PROGRESS });
        } else if (ticket.status === TicketStatus.IN_PROGRESS) {
            updateStatus.mutate({ id: ticket.id, status: TicketStatus.RESOLVED });
        }
    };

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                    <div className="flex gap-2">
                        <Badge variant="outline" className={`${statusConfig[ticket.status].color} border-0 flex items-center gap-1`}>
                            <StatusIcon size={12} /> {statusConfig[ticket.status].label}
                        </Badge>
                        <Badge variant="outline" className={priority.color}>
                            {priority.label}
                        </Badge>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>

                <div>
                    <h3 className="font-bold text-gray-900 line-clamp-1">{ticket.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">{ticket.description}</p>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Hammer size={12} />
                    <span>{ticket.unit.property?.name} - {ticket.unit.name}</span>
                </div>

                {ticket.reportedBy && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <User size={12} />
                        <span>Reportado por: {ticket.reportedBy.firstName}</span>
                    </div>
                )}

                <div className="pt-2 flex justify-end">
                    {ticket.status === TicketStatus.OPEN && (
                        <Button size="sm" variant="outline" onClick={handleAdvance} disabled={updateStatus.isPending}>
                            Iniciar
                        </Button>
                    )}
                    {ticket.status === TicketStatus.IN_PROGRESS && (
                        <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700" onClick={handleAdvance} disabled={updateStatus.isPending}>
                            Resolver
                        </Button>
                    )}
                    {ticket.status === TicketStatus.RESOLVED && (
                        <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                            <CheckCircle size={12} /> Resuelto el {new Date(ticket.resolvedAt || '').toLocaleDateString()}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
