import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { exitNoticeApi, CreateExitNoticeDto } from '../services/exitNoticeApi';
import { toast } from 'sonner';

export function useExitNotices(leaseId: string) {
    return useQuery({
        queryKey: ['exitNotices', leaseId],
        queryFn: () => exitNoticeApi.getByLease(leaseId),
        enabled: !!leaseId
    });
}

export function useCreateExitNotice() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ leaseId, data }: { leaseId: string; data: CreateExitNoticeDto }) =>
            exitNoticeApi.create(leaseId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['exitNotices', variables.leaseId] });
            queryClient.invalidateQueries({ queryKey: ['lease', variables.leaseId] });
            toast.success('Aviso de salida registrado exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al registrar aviso de salida');
        }
    });
}

export function useConfirmExitNotice() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: exitNoticeApi.confirm,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exitNotices'] });
            queryClient.invalidateQueries({ queryKey: ['lease'] });
            toast.success('Aviso de salida confirmado');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al confirmar aviso');
        }
    });
}

export function useCancelExitNotice() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: exitNoticeApi.cancel,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exitNotices'] });
            toast.success('Aviso de salida cancelado');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al cancelar aviso');
        }
    });
}
