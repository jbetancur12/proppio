import { create } from 'zustand';

interface ImpersonationState {
    isImpersonating: boolean;
    impersonatedTenantId: string | null;
    impersonatedTenantName: string | null;
    originalToken: string | null;
    startImpersonation: (tenantId: string, tenantName: string) => void;
    endImpersonation: () => void;
}

export const useImpersonation = create<ImpersonationState>((set) => ({
    isImpersonating: localStorage.getItem('isImpersonating') === 'true',
    impersonatedTenantId: localStorage.getItem('impersonatedTenantId'),
    impersonatedTenantName: localStorage.getItem('impersonatedTenantName'),
    originalToken: localStorage.getItem('super_admin_token'),

    startImpersonation: (tenantId: string, tenantName: string) => {
        // Save current Super Admin token
        const currentToken = localStorage.getItem('token');
        localStorage.setItem('super_admin_token', currentToken || '');

        // Set impersonation state
        localStorage.setItem('isImpersonating', 'true');
        localStorage.setItem('impersonatedTenantId', tenantId);
        localStorage.setItem('impersonatedTenantName', tenantName);

        set({
            isImpersonating: true,
            impersonatedTenantId: tenantId,
            impersonatedTenantName: tenantName,
            originalToken: currentToken
        });
    },

    endImpersonation: () => {
        // Restore Super Admin token
        const superAdminToken = localStorage.getItem('super_admin_token');
        if (superAdminToken) {
            localStorage.setItem('token', superAdminToken);
        }

        // Clear impersonation state
        localStorage.removeItem('isImpersonating');
        localStorage.removeItem('impersonatedTenantId');
        localStorage.removeItem('impersonatedTenantName');
        localStorage.removeItem('super_admin_token');

        set({
            isImpersonating: false,
            impersonatedTenantId: null,
            impersonatedTenantName: null,
            originalToken: null
        });
    }
}));
