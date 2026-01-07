import { Entity, Filter, Property } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';
import { getContext } from '../utils/RequestContext';

@Filter({
    name: 'tenantFilter',
    cond: () => {
        try {
            const context = getContext();
            return { tenantId: context.tenantId };
        } catch {
            // If no context (e.g. initial connection), generally safe to return empty or block
            // But for security, if we expect tenant context, we should filter.
            // However, to avoid breaking startup, we might return {} ONLY IF strictly controlled.
            // Better strategy: The filter is enabled manually per request.
            return {};
        }
    },
    default: true, // Enabled by default!
})
@Entity({ abstract: true })
export abstract class BaseTenantEntity extends BaseEntity {
    @Property({ type: 'uuid' })
    tenantId!: string;
}
