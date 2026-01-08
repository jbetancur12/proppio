import { Entity, PrimaryKey, Property, ManyToOne, Index } from '@mikro-orm/core';
import { User } from '../../auth/entities/User';
import { Tenant } from '../../tenants/entities/Tenant';

@Entity({ tableName: 'audit_logs' })
export class AuditLog {
    @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
    id!: string;

    @ManyToOne({ entity: 'Tenant', nullable: true, deleteRule: 'cascade' })
    @Index()
    tenant?: Tenant;

    @ManyToOne({ entity: 'User', deleteRule: 'cascade' })
    @Index()
    user!: User;

    @Property({ type: 'string' })
    action!: string;

    @Property({ type: 'string', nullable: true })
    resourceType?: string;

    @Property({ nullable: true, type: 'uuid' })
    resourceId?: string;

    @Property({ type: 'jsonb', nullable: true })
    oldValues?: any;

    @Property({ type: 'jsonb', nullable: true })
    newValues?: any;

    @Property({ type: 'string', nullable: true })
    ipAddress?: string;

    @Property({ type: 'text', nullable: true })
    userAgent?: string;

    @Property({ type: 'datetime' })
    @Index()
    createdAt: Date = new Date();

    constructor(
        user: User,
        action: string,
        options?: {
            tenant?: Tenant;
            resourceType?: string;
            resourceId?: string;
            oldValues?: any;
            newValues?: any;
            ipAddress?: string;
            userAgent?: string;
        }
    ) {
        this.user = user;
        this.action = action;
        if (options) {
            this.tenant = options.tenant;
            this.resourceType = options.resourceType;
            this.resourceId = options.resourceId;
            this.oldValues = options.oldValues;
            this.newValues = options.newValues;
            this.ipAddress = options.ipAddress;
            this.userAgent = options.userAgent;
        }
    }
}
