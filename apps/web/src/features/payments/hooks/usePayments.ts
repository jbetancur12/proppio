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

export function useCreatePayment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: paymentsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments'] });
            queryClient.invalidateQueries({ queryKey: ['leases'] });
            toast.success("Pago registrado!");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error?.message || "Error al registrar pago");
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
