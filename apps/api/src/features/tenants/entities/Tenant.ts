import { Entity, Property, Enum } from '@mikro-orm/core';
import { BaseEntity } from '../../../shared/entities/BaseEntity';

export enum TenantStatus {
    ACTIVE = 'ACTIVE',
    SUSPENDED = 'SUSPENDED',
}

export enum TenantPlan {
    FREE = 'FREE',
    PRO = 'PRO',
}

@Entity({ tableName: 'tenants' })
export class Tenant extends BaseEntity {
    @Property()
    name!: string;

    @Enum(() => TenantStatus)
    status: TenantStatus = TenantStatus.ACTIVE;

    @Enum(() => TenantPlan)
    plan: TenantPlan = TenantPlan.FREE;

    @Property({ type: 'json', nullable: true })
    config?: Record<string, any>;
}
