import { AsyncLocalStorage } from 'async_hooks';

export interface UserContext {
    tenantId?: string; // Optional for Super Admin
    userId: string;
    role?: string;
    globalRole?: string; // For Super Admin
}

export const requestContext = new AsyncLocalStorage<UserContext>();

export const getContext = (): UserContext => {
    const store = requestContext.getStore();
    if (!store) {
        throw new Error('No Request Context available. Are you running inside the TenantMiddleware?');
    }
    return store;
};

// Helper for background jobs or scripts where we want to simulate context
export const runInContext = <T>(ctx: UserContext, callback: () => T): T => {
    return requestContext.run(ctx, callback);
};
