import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leasesApi } from "../services/leasesApi";
import { toast } from "sonner";

export function useLeases() {
    return useQuery({
        queryKey: ['leases'],
        queryFn: leasesApi.getAll
    });
}

export function useLease(id: string) {
    return useQuery({
        queryKey: ['lease', id],
        queryFn: () => leasesApi.getById(id),
        enabled: !!id
    });
}

export function useCreateLease() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: leasesApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leases'] });
            toast.success("Contrato creado!");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error?.message || "Error al crear contrato");
        }
    });
}

export function useActivateLease() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: leasesApi.activate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leases'] });
            toast.success("Contrato activado!");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error?.message || "Error al activar contrato");
        }
    });
}

export function useTerminateLease() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: leasesApi.terminate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leases'] });
            toast.success("Contrato terminado");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error?.message || "Error al terminar contrato");
        }
    });
}
