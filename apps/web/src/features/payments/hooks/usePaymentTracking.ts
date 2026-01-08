import { useQuery } from '@tanstack/react-query';
import { paymentTrackingApi } from '../services/paymentTrackingApi';

export function usePendingPayments(leaseId: string) {
    return useQuery({
        queryKey: ['pendingPayments', leaseId],
        queryFn: () => paymentTrackingApi.getPendingPayments(leaseId),
        enabled: !!leaseId
    });
}
