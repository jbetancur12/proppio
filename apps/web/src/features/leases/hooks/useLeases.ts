import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leasesApi } from "../services/leasesApi";
import { toast } from "sonner";

export function useLeases() {
    return useQuery({
        queryKey: ['leases'],
        queryFn: leasesApi.getAll
    });
}

export function useExpiringLeases(days: number = 60) {
    return useQuery({
        queryKey: ['leases', 'expiring', days],
        queryFn: () => leasesApi.getExpiring(days)
    });
}

export function useLease(id: string) {
    return useQuery({
        queryKey: ['lease', id],
        queryFn: () => leasesApi.getById(id),
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

export function useCreateLease() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: leasesApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leases'] });
            toast.success("Contrato creado!");
        },
        onError: (error: unknown) => {
            const apiError = error as ApiError;
            toast.error(apiError.response?.data?.error?.message || "Error al crear contrato");
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
        onError: (error: unknown) => {
            const apiError = error as ApiError;
            toast.error(apiError.response?.data?.error?.message || "Error al activar contrato");
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
        onError: (error: unknown) => {
            const apiError = error as ApiError;
            toast.error(apiError.response?.data?.error?.message || "Error al terminar contrato");
        }
    });
}

export function useUploadContract() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, file }: { id: string; file: File }) => leasesApi.uploadContract(id, file),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['lease', variables.id] });
            toast.success("Contrato subido exitosamente");
        },
        onError: (error: unknown) => {
            const apiError = error as ApiError;
            toast.error(apiError.response?.data?.error?.message || "Error al subir contrato");
        }
    });
}
