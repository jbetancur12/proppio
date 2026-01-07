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
    @Property({ type: 'string' })
    name!: string;

    @Property({ type: 'string', unique: true })
    slug!: string;

    @Enum(() => TenantStatus)
    status: TenantStatus = TenantStatus.ACTIVE;

    @Property({ type: 'string', nullable: true })
    plan?: string;

    @Property({ type: 'json', nullable: true })
    config?: Record<string, any>;
}
