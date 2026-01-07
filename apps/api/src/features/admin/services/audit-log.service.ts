import { EntityManager } from '@mikro-orm/postgresql'; // Use postgresql specific manager or core
import { AuditLog } from '../entities/AuditLog';
import { User } from '../../auth/entities/User';
import { Tenant } from '../../tenants/entities/Tenant';
import { requestContext } from '../../../shared/utils/RequestContext'; // Correct import name

export interface AuditLogDto {
    action: string;
    resourceType?: string;
    resourceId?: string;
    oldValues?: any;
    newValues?: any;
    details?: any;
}

export class AuditLogService {
    constructor(private readonly em: EntityManager) { }

    async log(data: AuditLogDto): Promise<void> {
        try {
            const ctx = requestContext.current(); // Use correct casing
            const em = this.em.fork(); // Always fork to avoid context pollution

            if (!ctx.userId) {
                // console.warn('AuditLog: No userId in context', data);
                return;
            }

            const user = await em.getReference(User, ctx.userId);
            const tenant = ctx.tenantId ? await em.getReference(Tenant, ctx.tenantId) : undefined;

            const log = new AuditLog(user, data.action, {
                tenant,
                resourceType: data.resourceType,
                resourceId: data.resourceId,
                oldValues: data.oldValues,
                newValues: data.newValues || data.details,
                ipAddress: (ctx as any).ip, // Assuming IP might be added to context
                userAgent: (ctx as any).userAgent // Assuming UserAgent might be added to context
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
        const qb = this.em.createQueryBuilder(AuditLog, 'l'); // EntityManager should have createQueryBuilder

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
