import { EventArgs, EventSubscriber, FlushEventArgs } from '@mikro-orm/core';
import { BaseTenantEntity } from '../entities/BaseTenantEntity';
import { requestContext } from '../utils/RequestContext';

export class TenantSubscriber implements EventSubscriber {
    // Before persisting a new entity, assign the tenantId from context
    async beforeCreate(args: EventArgs<BaseTenantEntity>): Promise<void> {
        const entity = args.entity;

        // Only process entities that extend BaseTenantEntity and don't have tenantId yet
        if (entity instanceof BaseTenantEntity && !entity.tenantId) {
            try {
                // Get context directly from AsyncLocalStorage
                const context = requestContext.getStore();

                if (context?.tenantId) {
                    entity.tenantId = context.tenantId;
                }
            } catch (e) {
                // No context available (e.g., running migrations or scripts)
            }
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
                        // CRITICAL: Modify the changeset payload directly
                        changeSet.payload.tenantId = context.tenantId;
                    } else if (entity instanceof BaseTenantEntity && entity.tenantId && !changeSet.payload.tenantId) {
                        // If entity has tenantId but payload doesn't, sync them
                        changeSet.payload.tenantId = entity.tenantId;
                    }
                }
            }
        } catch (e) {
            // Silent fail for contexts without tenant (migrations, scripts, etc.)
        }
    }
}
