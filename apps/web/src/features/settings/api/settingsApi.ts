import { api } from "@/api/client";

export const settingsApi = {
    changePassword: async (data: any) => {
        const res = await api.post("/api/auth/change-password", data);
        return res.data;
    },

    getSubscription: async () => {
        const res = await api.get("/api/tenants/subscription");
        return res.data;
    }
};
