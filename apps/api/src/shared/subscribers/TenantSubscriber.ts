import { EventSubscriber, EventArgs } from '@mikro-orm/core';
import { BaseTenantEntity } from '../entities/BaseTenantEntity';
import { getContext } from '../utils/RequestContext';

export class TenantSubscriber implements EventSubscriber<BaseTenantEntity> {
    // Only subscribe to entities that extend BaseTenantEntity?
    // MikroORM subscribers are global or entity specific. We can check via instanceof.

    async beforeCreate(args: EventArgs<BaseTenantEntity>): Promise<void> {
        const entity = args.entity;

        // Check if it looks like a Tenant Entity (has tenantId property)
        // or strictly is instance of BaseTenantEntity
        if (entity instanceof BaseTenantEntity) {
            if (!entity.tenantId) {
                try {
                    const ctx = getContext();
                    // Only set tenantId if user has one (not Super Admin)
                    if (ctx.tenantId) {
                        entity.tenantId = ctx.tenantId;
                    }
                } catch (e) {
                    // If running a seed or super-admin task without context, you must explicitly set tenantId
                    // OR we throw error to prevent accidental global data creation.
                    console.warn('⚠️ Creating BaseTenantEntity without Context or explicit tenantId. This might be unsafe.');
                }
            }
        }
    }
}
