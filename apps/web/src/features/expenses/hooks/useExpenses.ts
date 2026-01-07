import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { expensesApi } from "../services/expensesApi";
import { toast } from "sonner";

export function useExpenses(propertyId?: string) {
    return useQuery({
        queryKey: ['expenses', propertyId],
        queryFn: () => expensesApi.getAll(propertyId)
    });
}

export function useCreateExpense() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: expensesApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            toast.success("Gasto registrado exitosamente");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error?.message || "Error al registrar gasto");
        }
    });
}

export function useDeleteExpense() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: expensesApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            toast.success("Gasto eliminado");
        },
        onError: () => toast.error("Error al eliminar gasto")
    });
}
