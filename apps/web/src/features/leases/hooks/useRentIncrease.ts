import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rentIncreaseApi, IncreasePreview, ApplyIncreaseDto } from '../services/rentIncreaseApi';
import { toast } from 'sonner';

export function useRentIncreasePreviews(increasePercentage: number) {
    return useQuery<IncreasePreview[]>({
        queryKey: ['rent-increase-preview', increasePercentage],
        queryFn: () => rentIncreaseApi.previewIncreases(increasePercentage),
        enabled: increasePercentage > 0
    });
}

export function useApplyRentIncrease() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: ApplyIncreaseDto) => rentIncreaseApi.applyIncrease(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leases'] });
            toast.success('Aumento aplicado exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error?.message || 'Error al aplicar aumento');
        }
    });
}

export function useBulkApplyIncreases() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (increases: ApplyIncreaseDto[]) => rentIncreaseApi.bulkApplyIncreases(increases),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['leases'] });
            toast.success(`${variables.length} aumentos aplicados exitosamente`);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error?.message || 'Error al aplicar aumentos');
        }
    });
}

export function useIPCConfig(year: number) {
    return useQuery({
        queryKey: ['ipc-config', year],
        queryFn: () => rentIncreaseApi.getIPC(year)
    });
}

export function useSetIPC() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ year, ipcRate }: { year: number; ipcRate: number }) =>
            rentIncreaseApi.setIPC(year, ipcRate),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['ipc-config', variables.year] });
            toast.success(`IPC ${variables.year} configurado: ${variables.ipcRate}%`);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error?.message || 'Error al configurar IPC');
        }
    });
}
