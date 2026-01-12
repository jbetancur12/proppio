import { useCallback } from 'react';

/**
 * Hook to format currency in Colombian Pesos
 * @returns Function to format numbers as COP currency
 */
export function useCurrency() {
    return useCallback(
        (value: number) =>
            new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                maximumFractionDigits: 0,
            }).format(value),
        [],
    );
}
