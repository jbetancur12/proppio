import { EntityManager } from '@mikro-orm/core';
import { Tenant } from '../entities/Tenant';
import { NotFoundError } from '../../../shared/errors/AppError';

export class TenantsService {
    constructor(private readonly em: EntityManager) { }

    async getSubscription(tenantId: string) {
        const tenant = await this.em.findOne(Tenant, { id: tenantId });
        if (!tenant) {
            throw new NotFoundError('Tenant no encontrado');
        }

        return {
            plan: tenant.plan || 'FREE',
            status: tenant.status,
            renewalDate: null // To be implemented when Subscription entity is added
        };
    }
}
