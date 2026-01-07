import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { propertiesApi } from "../services/propertiesApi";
import { toast } from "sonner";

export function useProperties() {
    return useQuery({
        queryKey: ['properties'],
        queryFn: propertiesApi.getAll
    });
}

export function useProperty(id: string) {
    return useQuery({
        queryKey: ['property', id],
        queryFn: () => propertiesApi.getById(id),
        enabled: !!id
    });
}

export function useCreateProperty() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: propertiesApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['properties'] });
            toast.success("Propiedad creada!");
        },
        onError: () => toast.error("Error al crear propiedad")
    });
}

export function useUnits(propertyId: string) {
    return useQuery({
        queryKey: ['units', propertyId],
        queryFn: () => propertiesApi.getUnits(propertyId),
        enabled: !!propertyId
    });
}

export function useCreateUnit(propertyId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: propertiesApi.createUnit,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['units', propertyId] });
            toast.success("Unidad creada");
        },
        onError: () => toast.error("Error al crear la unidad")
    });
}
