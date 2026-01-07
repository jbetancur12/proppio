import { Entity, Property, ManyToOne, Enum } from '@mikro-orm/core';
import { BaseEntity } from '../../../shared/entities/BaseEntity';
import { User } from './User';
import { Tenant } from '../../tenants/entities/Tenant';

export enum TenantRole {
    ADMIN = 'ADMIN',
    MEMBER = 'MEMBER',
}

@Entity({ tableName: 'tenant_users' })
export class TenantUser extends BaseEntity {
    @ManyToOne({ entity: 'Tenant', type: 'string' })
    tenant!: Tenant;

    @ManyToOne({ entity: 'User', type: 'string' })
    user!: User;

    @Enum(() => TenantRole)
    role!: TenantRole;

    constructor(partial?: Partial<TenantUser>) {
        super();
        Object.assign(this, partial);
    }
}
