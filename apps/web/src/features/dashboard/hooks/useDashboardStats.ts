import { useQuery } from "@tanstack/react-query";
import { statsApi } from "../services/statsApi";

export function useDashboardStats() {
    return useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: statsApi.getDashboard,
        refetchInterval: 30000 // Refresh every 30 seconds
    });
}
