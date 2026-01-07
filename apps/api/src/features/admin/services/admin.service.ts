import { EntityManager } from '@mikro-orm/core';
import { Tenant, TenantStatus } from '../../tenants/entities/Tenant';
import { User } from '../../auth/entities/User';
import { TenantUser } from '../../auth/entities/TenantUser';
import { PropertyEntity } from '../../properties/entities/Property';
import { Lease } from '../../leases/entities/Lease';

export interface TenantStats {
    propertiesCount: number;
    leasesCount: number;
    usersCount: number;
}

export class AdminService {
    constructor(private readonly em: EntityManager) { }

    async getAllTenants(): Promise<Tenant[]> {
        return this.em.find(Tenant, {}, { orderBy: { createdAt: 'DESC' } });
    }

    async getTenantById(id: string): Promise<Tenant | null> {
        return this.em.findOne(Tenant, { id });
    }

    async getTenantStats(tenantId: string): Promise<TenantStats> {
        const propertiesCount = await this.em.count(PropertyEntity, { tenant: { id: tenantId } });
        const leasesCount = await this.em.count(Lease, { tenantId });
        const usersCount = await this.em.count(TenantUser, { tenant: { id: tenantId } });

        return {
            propertiesCount,
            leasesCount,
            usersCount
        };
    }

    async suspendTenant(id: string): Promise<void> {
        const tenant = await this.em.findOne(Tenant, { id });
        if (!tenant) throw new Error('Tenant not found');

        tenant.status = TenantStatus.SUSPENDED;
        await this.em.flush();
    }

    async activateTenant(id: string): Promise<void> {
        const tenant = await this.em.findOne(Tenant, { id });
        if (!tenant) throw new Error('Tenant not found');

        tenant.status = TenantStatus.ACTIVE;
        await this.em.flush();
    }

    async getAllUsers(): Promise<User[]> {
        return this.em.find(User, {}, { orderBy: { createdAt: 'DESC' } });
    }

    async getUsersByTenant(tenantId: string): Promise<TenantUser[]> {
        return this.em.find(TenantUser, { tenant: { id: tenantId } }, { populate: ['user'] });
    }

    async getGlobalMetrics() {
        const totalTenants = await this.em.count(Tenant, {});
        const activeTenants = await this.em.count(Tenant, { status: TenantStatus.ACTIVE });
        const suspendedTenants = await this.em.count(Tenant, { status: TenantStatus.SUSPENDED });
        const totalUsers = await this.em.count(User, {});

        return {
            totalTenants,
            activeTenants,
            suspendedTenants,
            totalUsers
        };
    }
}
