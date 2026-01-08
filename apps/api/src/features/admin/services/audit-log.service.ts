import { EntityManager } from '@mikro-orm/core';
import { EntityManager as SqlEntityManager } from '@mikro-orm/postgresql';
import { AuditLog } from '../entities/AuditLog';
import { User } from '../../auth/entities/User';
import { Tenant } from '../../tenants/entities/Tenant';
import { getContext } from '../../../shared/utils/RequestContext';

export interface AuditLogDto {
    action: string;
    resourceType?: string;
    resourceId?: string;
    oldValues?: any;
    newValues?: any;
    details?: any;
    userId?: string;   // Explicit override
    tenantId?: string; // Explicit override
    performedBy?: string; // User ID or SYSTEM
}

export class AuditLogService {
    constructor(private readonly em: EntityManager) { }

    async log(data: AuditLogDto): Promise<void> {
        try {
            let ctx;
            try {
                ctx = getContext();
            } catch (e) {
                // Ignore if no context available and overrides provided
            }

            // Use fork to ensure we have a clean state/context if needed, 
            // but usually for logging we might want to share transaction or not. 
            // Original code used fork(), let's keep it but check if it's needed.
            // If em is generic, fork() returns generic EM.
            const em = this.em.fork();

            // Use explicit values or fallback to context
            const userId = data.userId || ctx?.userId;
            const tenantId = data.tenantId || ctx?.tenantId;

            if (!userId) {
                return;
            }

            const user = await em.getReference(User, userId);
            const tenant = tenantId ? await em.getReference(Tenant, tenantId) : undefined;

            const log = new AuditLog(user, data.action, {
                tenant,
                resourceType: data.resourceType,
                resourceId: data.resourceId,
                oldValues: data.oldValues,
                newValues: data.newValues || data.details,
                // ipAddress: (ctx as any).ip, 
                // userAgent: (ctx as any).userAgent 
            });

            await em.persistAndFlush(log);
        } catch (error) {
            console.error('Failed to create audit log:', error);
        }
    }

    async getLogs(filters: {
        tenantId?: string;
        userId?: string;
        action?: string;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
        offset?: number;
    }) {
        // Cast to SqlEntityManager to use createQueryBuilder
        const qb = (this.em as SqlEntityManager).createQueryBuilder(AuditLog, 'l');

        qb.select('*')
            .leftJoinAndSelect('l.user', 'u')
            .leftJoinAndSelect('l.tenant', 't')
            .orderBy({ createdAt: 'DESC' });

        if (filters.tenantId) {
            qb.andWhere({ tenant: filters.tenantId });
        }

        if (filters.userId) {
            qb.andWhere({ user: filters.userId });
        }

        if (filters.action) {
            qb.andWhere({ action: { $ilike: `%${filters.action}%` } });
        }

        if (filters.startDate) {
            qb.andWhere({ createdAt: { $gte: filters.startDate } });
        }

        if (filters.endDate) {
            qb.andWhere({ createdAt: { $lte: filters.endDate } });
        }

        if (filters.limit) {
            qb.limit(filters.limit);
        }

        if (filters.offset) {
            qb.offset(filters.offset);
        }

        const [logs, count] = await qb.getResultAndCount();
        return { logs, count };
    }
}
