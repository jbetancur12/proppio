import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, CreateTenantDto } from '../services/adminApi';
import { toast } from 'sonner';

export function useAllTenants() {
    return useQuery({
        queryKey: ['admin-tenants'],
        queryFn: () => adminApi.getAllTenants()
    });
}

export function useTenant(id: string) {
    return useQuery({
        queryKey: ['admin-tenant', id],
        queryFn: () => adminApi.getTenant(id),
        enabled: !!id
    });
}

export function useCreateTenant() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateTenantDto) => adminApi.createTenant(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-tenants'] });
            toast.success('Tenant creado exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error?.message || 'Error al crear tenant');
        }
    });
}

export function useUpdateTenantStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'SUSPENDED' }) =>
            adminApi.updateTenantStatus(id, status),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin-tenants'] });
            queryClient.invalidateQueries({ queryKey: ['admin-tenant', variables.id] });
            toast.success(`Tenant ${variables.status === 'ACTIVE' ? 'activado' : 'suspendido'} exitosamente`);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error?.message || 'Error al actualizar tenant');
        }
    });
}

export function useGlobalMetrics() {
    return useQuery({
        queryKey: ['admin-metrics'],
        queryFn: () => adminApi.getGlobalMetrics()
    });
}
