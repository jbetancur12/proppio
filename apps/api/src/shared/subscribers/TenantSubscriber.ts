import { EventArgs, EventSubscriber, FlushEventArgs } from '@mikro-orm/core';
import { BaseTenantEntity } from '../entities/BaseTenantEntity';
import { requestContext } from '../utils/RequestContext';

export class TenantSubscriber implements EventSubscriber {
    // Before persisting a new entity, assign the tenantId from context
    async beforeCreate(args: EventArgs<BaseTenantEntity>): Promise<void> {
        console.log('[TenantSubscriber] beforeCreate triggered for:', args.entity.constructor.name);
        const entity = args.entity;

        // Only process entities that extend BaseTenantEntity and don't have tenantId yet
        if (entity instanceof BaseTenantEntity && !entity.tenantId) {
            try {
                // Get context directly from AsyncLocalStorage
                const context = requestContext.getStore();

                if (context?.tenantId) {
                    entity.tenantId = context.tenantId;
                    console.log(`[TenantSubscriber] ✅ Assigned tenantId ${context.tenantId} to ${entity.constructor.name} in beforeCreate`);
                } else {
                    console.warn(`[TenantSubscriber] ⚠️ No tenantId in context for ${entity.constructor.name}`);
                }
            } catch (e) {
                console.error('[TenantSubscriber] ❌ Error getting context:', e);
                // No context available (e.g., running migrations or scripts)
            }
        } else if (entity.tenantId) {
            console.log(`[TenantSubscriber] tenantId already set for ${entity.constructor.name}: ${entity.tenantId}`);
        }
    }

    // Also assign tenantId during flush if still missing
    async onFlush(args: FlushEventArgs): Promise<void> {
        const changeSets = args.uow.getChangeSets();

        try {
            // Get context directly from AsyncLocalStorage
            const context = requestContext.getStore();

            if (context?.tenantId) {
                for (const changeSet of changeSets) {
                    const entity = changeSet.entity;

                    if (entity instanceof BaseTenantEntity && !entity.tenantId) {
                        entity.tenantId = context.tenantId;
                        console.log(`[TenantSubscriber] Assigned tenantId ${context.tenantId} to ${entity.constructor.name} during flush`);
                    }
                }
            }
        } catch (e) {
            console.error('[TenantSubscriber] Error during flush:', e);
        }
    }
}
