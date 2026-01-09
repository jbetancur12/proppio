import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rentersApi } from "../services/rentersApi";
import { toast } from "sonner";

export function useRenters() {
    return useQuery({
        queryKey: ['renters'],
        queryFn: rentersApi.getAll
    });
}

export function useCreateRenter() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: rentersApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['renters'] });
            toast.success("Inquilino creado!");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error?.message || "Error al crear inquilino");
        }
    });
}

export function useRenterHistory(id: string) {
    return useQuery({
        queryKey: ['renter', id, 'history'],
        queryFn: () => rentersApi.getHistory(id),
        enabled: !!id
    });
}

export function useUpdateRenter() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => rentersApi.update(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['renters'] });
            queryClient.invalidateQueries({ queryKey: ['renter', data.id, 'history'] });
            toast.success("Inquilino actualizado!");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error?.message || "Error al actualizar inquilino");
        }
    });
}
