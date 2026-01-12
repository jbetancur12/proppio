import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesApi } from '../services/expensesApi';
import { toast } from 'sonner';

interface UseExpensesParams {
    page?: number;
    limit?: number;
    search?: string;
    propertyId?: string;
}

export function useExpenses(params: UseExpensesParams = {}) {
    return useQuery({
        queryKey: ['expenses', params],
        queryFn: () => expensesApi.getAll(params),
        placeholderData: (previousData) => previousData,
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

export function useCreateExpense() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: expensesApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            toast.success('Gasto registrado exitosamente');
        },
        onError: (error: unknown) => {
            const apiError = error as ApiError;
            toast.error(apiError.response?.data?.error?.message || 'Error al registrar gasto');
        },
    });
}

export function useDeleteExpense() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: expensesApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            toast.success('Gasto eliminado');
        },
        onError: () => toast.error('Error al eliminar gasto'),
    });
}
