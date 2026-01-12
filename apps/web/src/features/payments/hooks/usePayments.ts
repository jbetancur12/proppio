import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentsApi } from "../services/paymentsApi";
import { toast } from "sonner";

export function usePayments(leaseId?: string) {
    return useQuery({
        queryKey: leaseId ? ['payments', leaseId] : ['payments'],
        queryFn: () => paymentsApi.getAll(leaseId)
    });
}

export function usePayment(id: string) {
    return useQuery({
        queryKey: ['payment', id],
        queryFn: () => paymentsApi.getById(id),
        enabled: !!id
    });
}

interface ApiError {
    response?: {
        data?: {
            error?: {
                message?: string;
            };
        };
    };
}

export function useCreatePayment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: paymentsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments'] });
            queryClient.invalidateQueries({ queryKey: ['leases'] });
            toast.success("Pago registrado!");
        },
        onError: (error: unknown) => {
            const apiError = error as ApiError;
            toast.error(apiError.response?.data?.error?.message || "Error al registrar pago");
        }
    });
}

export function useUpdatePayment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: paymentsApi.update,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments'] });
            queryClient.invalidateQueries({ queryKey: ['leases'] }); // For pending payments count
            toast.success("Pago actualizado exitosamente");
        },
        onError: (error: unknown) => {
            const apiError = error as ApiError;
            toast.error(apiError.response?.data?.error?.message || "Error al actualizar pago");
        }
    });
}

export function useDeletePayment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: paymentsApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments'] });
            queryClient.invalidateQueries({ queryKey: ['leases'] });
            toast.success("Pago eliminado");
        },
        onError: (error: unknown) => {
            const apiError = error as ApiError;
            toast.error(apiError.response?.data?.error?.message || "Error al eliminar pago");
        }
    });
}

export function usePaymentSummary(leaseId: string) {
    return useQuery({
        queryKey: ['payment-summary', leaseId],
        queryFn: () => paymentsApi.getSummary(leaseId),
        enabled: !!leaseId
    });
}
