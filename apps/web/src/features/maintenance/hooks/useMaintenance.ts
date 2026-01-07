import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { maintenanceApi, TicketStatus } from "../services/maintenanceApi";
import { toast } from "sonner";

export function useMaintenanceTickets(params?: { status?: string; unitId?: string }) {
    return useQuery({
        queryKey: ['maintenance', params],
        queryFn: () => maintenanceApi.getAll(params)
    });
}

export function useCreateTicket() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: maintenanceApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['maintenance'] });
            toast.success("Ticket creado exitosamente");
        },
        onError: (err) => {
            toast.error("Error al crear ticket");
            console.error(err);
        }
    });
}

export function useUpdateTicketStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: TicketStatus }) => maintenanceApi.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['maintenance'] });
            toast.success("Estado actualizado");
        },
        onError: (err) => {
            toast.error("Error al actualizar estado");
            console.error(err);
        }
    });
}
