import { EntityManager } from '@mikro-orm/core';
import { logger } from '../../../shared/logger';
import { Renter } from '../entities/Renter';
import { CreateRenterDto, UpdateRenterDto } from '../dtos/renter.dto';
import { AppError, NotFoundError, ValidationError } from '../../../shared/errors/AppError';
import { Lease } from '../../leases/entities/Lease';
import { Payment } from '../../payments/entities/Payment';
import { MaintenanceTicket } from '../../maintenance/entities/MaintenanceTicket';
import { PaginationDto, PaginatedResponse } from '../../../shared/dtos/pagination.dto';

export class RentersService {
    constructor(private readonly em: EntityManager) {}

    async findAll(query: PaginationDto): Promise<PaginatedResponse<Renter>> {
        const { page = 1, limit = 10, search } = query;
        const offset = (page - 1) * limit;

        const where: any = {};
        if (search) {
            where.$or = [
                { firstName: { $ilike: `%${search}%` } },
                { lastName: { $ilike: `%${search}%` } },
                { email: { $ilike: `%${search}%` } },
                { identification: { $ilike: `%${search}%` } },
            ];
        }

        const [items, total] = await this.em.findAndCount(Renter, where, {
            limit,
            offset,
            orderBy: { createdAt: 'DESC' },
        });

        return {
            data: items,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string): Promise<Renter> {
        const renter = await this.em.findOne(Renter, { id });
        if (!renter) throw new NotFoundError('Renter not found');
        return renter;
    }

    async create(data: CreateRenterDto): Promise<Renter> {
        // Check for duplicates (identification)
        const existing = await this.em.findOne(Renter, { identification: data.identification });
        if (existing) {
            throw new ValidationError('A renter with this identification already exists.');
        }

        const renter = new Renter(data);
        await this.em.persistAndFlush(renter);

        // Audit Log
        try {
            const auditService = new (await import('../../admin/services/audit-log.service')).AuditLogService(this.em);
            await auditService.log({
                action: 'CREATE_RENTER',
                resourceType: 'Renter',
                resourceId: renter.id,
                newValues: data,
            });
        } catch (error) {
            logger.error({ err: error }, 'Audit log failed for create renter');
        }

        return renter;
    }

    async update(id: string, data: UpdateRenterDto): Promise<Renter> {
        const renter = await this.findOne(id);
        const oldValues = { ...renter }; // Shallow copy

        // If updating identification, check uniqueness
        if (data.identification && data.identification !== renter.identification) {
            const existing = await this.em.findOne(Renter, { identification: data.identification });
            if (existing) throw new ValidationError('Identification already used by another renter.');
        }

        this.em.assign(renter, data);
        await this.em.flush();

        // Audit Log
        try {
            const auditService = new (await import('../../admin/services/audit-log.service')).AuditLogService(this.em);
            await auditService.log({
                action: 'UPDATE_RENTER',
                resourceType: 'Renter',
                resourceId: renter.id,
                oldValues: {
                    firstName: oldValues.firstName,
                    lastName: oldValues.lastName,
                    email: oldValues.email,
                    phone: oldValues.phone,
                    identification: oldValues.identification,
                },
                newValues: data,
            });
        } catch (error) {
            logger.error({ err: error }, 'Audit log failed for update renter');
        }

        return renter;
    }

    async delete(id: string): Promise<void> {
        const renter = await this.findOne(id);
        const oldValues = {
            name: `${renter.firstName} ${renter.lastName}`,
            email: renter.email,
        };

        await this.em.removeAndFlush(renter);

        // Audit Log
        try {
            const auditService = new (await import('../../admin/services/audit-log.service')).AuditLogService(this.em);
            await auditService.log({
                action: 'DELETE_RENTER',
                resourceType: 'Renter',
                resourceId: id,
                oldValues,
            });
        } catch (error) {
            logger.error({ err: error }, 'Audit log failed for delete renter');
        }
    }

    async getHistory(id: string) {
        const renter = await this.findOne(id);

        // Find Leases
        const leases = await this.em.find(
            Lease,
            { renter },
            { populate: ['unit', 'unit.property'], orderBy: { startDate: 'DESC' } },
        );
        const leaseIds = leases.map((l) => l.id);

        // Find Payments (linked to Renter's leases)
        const payments =
            leaseIds.length > 0
                ? await this.em.find(
                      Payment,
                      { lease: { $in: leaseIds } },
                      { populate: ['lease', 'lease.unit'], orderBy: { paymentDate: 'DESC' } },
                  )
                : [];

        // Find Tickets
        const tickets = await this.em.find(
            MaintenanceTicket,
            { reportedBy: renter },
            { populate: ['unit', 'unit.property'], orderBy: { createdAt: 'DESC' } },
        );

        return {
            renter,
            leases,
            payments,
            tickets,
        };
    }
}
