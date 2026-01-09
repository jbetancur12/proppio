import { EventArgs, EventSubscriber, FlushEventArgs } from '@mikro-orm/core';
import { BaseTenantEntity } from '../entities/BaseTenantEntity';
import { getContext } from '../utils/RequestContext';

export class TenantSubscriber implements EventSubscriber {
    // Before persisting a new entity, assign the tenantId from context
    async beforeCreate(args: EventArgs<BaseTenantEntity>): Promise<void> {
        const entity = args.entity;

        // Only process entities that extend BaseTenantEntity and don't have tenantId yet
        if (entity instanceof BaseTenantEntity && !entity.tenantId) {
            try {
                const context = getContext();

                if (context?.tenantId) {
                    entity.tenantId = context.tenantId;
                }
            } catch (e) {
                // No context available (e.g., running migrations or scripts)
                // This is expected in some scenarios
            }
        }
    }

    // Also assign tenantId during flush if still missing
    async onFlush(args: FlushEventArgs): Promise<void> {
        const changeSets = args.uow.getChangeSets();

        try {
            const context = getContext();

            for (const changeSet of changeSets) {
                const entity = changeSet.entity;

                if (entity instanceof BaseTenantEntity && !entity.tenantId && context?.tenantId) {
                    entity.tenantId = context.tenantId;
                }
            }
        } catch (e) {
            // No context available
        }
    }
}
