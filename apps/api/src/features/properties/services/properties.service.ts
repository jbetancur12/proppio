import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { PropertyEntity } from '../entities/Property';
import { CreatePropertyDto, UpdatePropertyDto } from '../dtos/property.dto';

export class PropertiesService {
    private repo: EntityRepository<PropertyEntity>;

    constructor(private em: EntityManager) {
        this.repo = em.getRepository(PropertyEntity);
    }

    async findAll() {
        return this.repo.findAll({ populate: ['units'] });
    }

    async findOne(id: string) {
        return this.repo.findOneOrFail({ id });
    }

    async create(dto: CreatePropertyDto) {
        const property = new PropertyEntity();
        property.name = dto.name;
        property.address = dto.address;

        await this.em.persistAndFlush(property);

        // Audit Log
        try {
            const auditService = new (await import('../../admin/services/audit-log.service')).AuditLogService(this.em);
            await auditService.log({
                action: 'CREATE_PROPERTY',
                resourceType: 'Property',
                resourceId: property.id,
                newValues: dto
            });
        } catch (error) {
            console.error('Audit log failed for create property:', error);
        }

        return property;
    }

    async update(id: string, dto: UpdatePropertyDto) {
        const property = await this.findOne(id);

        const oldValues = {
            name: property.name,
            address: property.address
        };

        if (dto.name) property.name = dto.name;
        if (dto.address) property.address = dto.address;

        await this.em.flush();

        // Audit Log
        try {
            const auditService = new (await import('../../admin/services/audit-log.service')).AuditLogService(this.em);
            await auditService.log({
                action: 'UPDATE_PROPERTY',
                resourceType: 'Property',
                resourceId: property.id,
                oldValues,
                newValues: dto
            });
        } catch (error) {
            console.error('Audit log failed for update property:', error);
        }

        return property;
    }

    async getStats(id: string) {
        // 1. Get Property with Units to calculate occupancy
        const property = await this.repo.findOneOrFail({ id }, { populate: ['units'] });
        const units = property.units.getItems();
        const totalUnits = units.length;

        // 2. Get Active Leases for this property to calculate revenue and occupied count accurately
        // (Assuming a unit is occupied if it has an active lease)
        const { Lease, LeaseStatus } = await import('../../leases/entities/Lease');
        const activeLeases = await this.em.find(Lease, {
            unit: { property: { id } },
            status: LeaseStatus.ACTIVE
        });

        // Occupancy calculation
        // We can map active leases to units.
        const occupiedUnitIds = new Set(activeLeases.map(l => l.unit.id));

        // Also consider units marked as OCCUPIED manually even if no lease (though less likely in this system)
        const occupiedCount = units.filter(u =>
            u.status === 'OCCUPIED' || occupiedUnitIds.has(u.id)
        ).length;

        const occupancyRate = totalUnits > 0 ? (occupiedCount / totalUnits) * 100 : 0;

        // 3. Projected Revenue (Sum of monthly rent of active leases)
        const projectedRevenue = activeLeases.reduce((sum, lease) => sum + lease.monthlyRent, 0);

        // 4. Maintenance Tickets
        const { MaintenanceTicket, TicketStatus } = await import('../../maintenance/entities/MaintenanceTicket');
        const openTickets = await this.em.count(MaintenanceTicket, {
            unit: { property: { id } },
            status: { $in: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS] }
        });

        return {
            totalUnits,
            occupiedUnits: occupiedCount,
            vacantUnits: totalUnits - occupiedCount,
            occupancyRate: Math.round(occupancyRate * 10) / 10,
            projectedRevenue,
            openMaintenanceTickets: openTickets
        };
    }
}
