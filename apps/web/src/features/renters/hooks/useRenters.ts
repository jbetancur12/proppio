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
