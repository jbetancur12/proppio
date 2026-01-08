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

export function useUpdateProperty() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: { name: string; address: string } }) =>
            propertiesApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['property', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['properties'] });
            toast.success("Propiedad actualizada");
        },
        onError: () => toast.error("Error al actualizar propiedad")
    });
}

export function useDeleteProperty() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: propertiesApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['properties'] });
            toast.success("Propiedad eliminada");
        },
        onError: () => toast.error("Error al eliminar propiedad")
    });
}

export function useUpdateUnit(propertyId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: { name: string; type: string; bedrooms?: number; bathrooms?: number; area?: number; baseRent?: number; status?: 'VACANT' | 'OCCUPIED' | 'MAINTENANCE' } }) =>
            propertiesApi.updateUnit(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['units', propertyId] });
            toast.success("Unidad actualizada");
        },
        onError: () => toast.error("Error al actualizar unidad")
    });
}

export function useDeleteUnit(propertyId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: propertiesApi.deleteUnit,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['units', propertyId] });
            toast.success("Unidad eliminada");
        },
        onError: () => toast.error("Error al eliminar unidad")
    });
}
