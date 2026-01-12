import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { logger } from '../../../shared/logger';
import { PropertyEntity } from '../entities/Property';
import { CreatePropertyDto, UpdatePropertyDto } from '../dtos/property.dto';

export class PropertiesService {
    private repo: EntityRepository<PropertyEntity>;

    constructor(private em: EntityManager) {
        this.repo = em.getRepository(PropertyEntity);
    }

    async findAll(): Promise<any[]> {
        // Populate deeply to check for alerts
        // Note: In a high-scale system, this should be optimized with a custom query or view
        const properties = await this.repo.findAll({
            populate: ['units', 'units.leases', 'units.leases.payments'] as any,
        });

        const today = new Date();
        const warningDate = new Date();
        warningDate.setDate(today.getDate() + 60); // 60 days warning

        return properties.map((property) => {
            const alerts: string[] = [];
            const units = property.units.getItems();

            let hasPendingPayments = false;
            let hasExpiringLeases = false;

            let occupiedCount = 0;
            const totalUnits = units.length;

            for (const unit of units) {
                // Safe check for leases
                const leases = unit.leases?.getItems() || [];
                let isOccupied = false;

                // Check unit status directly
                if (unit.status === 'OCCUPIED') {
                    isOccupied = true;
                }

                for (const lease of leases) {
                    // Check for Expiring Leases (Active only)
                    if (lease.status === 'ACTIVE') {
                        isOccupied = true; // Mark as occupied if active lease exists

                        const endDate = new Date(lease.endDate);
                        if (endDate <= warningDate && endDate >= today) {
                            hasExpiringLeases = true;
                        }

                        // Check for Pending Payments
                        const payments = lease.payments?.getItems() || [];
                        const pending = payments.some((p: any) => p.status === 'PENDING');
                        if (pending) {
                            hasPendingPayments = true;
                        }
                    }
                }

                if (isOccupied) {
                    occupiedCount++;
                }
            }

            const occupancyRate = totalUnits > 0 ? (occupiedCount / totalUnits) * 100 : 0;

            if (hasPendingPayments) alerts.push('PENDING_PAYMENTS');
            if (hasExpiringLeases) alerts.push('EXPIRING_LEASE');

            return {
                ...property, // properties of the entity
                units: property.units, // keep units collection
                alerts, // Add alerts
                occupancyRate: Math.round(occupancyRate), // Add integer occupancy rate
            };
        });
    }

    async findOne(id: string): Promise<any> {
        const property = await this.repo.findOneOrFail(
            { id },
            {
                populate: ['units', 'units.leases', 'units.leases.payments'] as any,
            },
        );

        const today = new Date();
        const warningDate = new Date();
        warningDate.setDate(today.getDate() + 60);

        // Calculate alerts per unit
        const unitsWithAlerts = property.units.getItems().map((unit) => {
            const alerts: string[] = [];
            const leases = unit.leases?.getItems() || [];

            let hasPendingPayments = false;
            let hasExpiringLeases = false;

            for (const lease of leases) {
                if (lease.status === 'ACTIVE') {
                    const endDate = new Date(lease.endDate);
                    if (endDate <= warningDate && endDate >= today) {
                        hasExpiringLeases = true;
                    }

                    const payments = lease.payments?.getItems() || [];
                    const pending = payments.some((p: any) => p.status === 'PENDING');
                    if (pending) {
                        hasPendingPayments = true;
                    }
                }
            }

            if (hasPendingPayments) alerts.push('PENDING_PAYMENTS');
            if (hasExpiringLeases) alerts.push('EXPIRING_LEASE');

            return {
                ...unit,
                alerts,
            };
        });

        // Return property with modified units
        return {
            ...property,
            units: unitsWithAlerts,
        };
    }

    async create(dto: CreatePropertyDto, tenantId: string) {
        const property = new PropertyEntity();
        property.name = dto.name;
        property.address = dto.address;
        // tenantId will be auto-assigned by TenantSubscriber

        await this.em.persistAndFlush(property);

        // Audit Log
        try {
            const auditService = new (await import('../../admin/services/audit-log.service')).AuditLogService(this.em);
            await auditService.log({
                action: 'CREATE_PROPERTY',
                resourceType: 'Property',
                resourceId: property.id,
                newValues: dto,
            });
        } catch (error) {
            logger.error({ err: error }, 'Audit log failed for create property');
        }

        return property;
    }

    async update(id: string, dto: UpdatePropertyDto): Promise<any> {
        const property = await this.findOne(id);

        const oldValues = {
            name: property.name,
            address: property.address,
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
                newValues: dto,
            });
        } catch (error) {
            logger.error({ err: error }, 'Audit log failed for update property');
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
            status: LeaseStatus.ACTIVE,
        });

        // Occupancy calculation
        // We can map active leases to units.
        const occupiedUnitIds = new Set(activeLeases.map((l) => l.unit.id));

        // Also consider units marked as OCCUPIED manually even if no lease (though less likely in this system)
        const occupiedCount = units.filter((u) => u.status === 'OCCUPIED' || occupiedUnitIds.has(u.id)).length;

        const occupancyRate = totalUnits > 0 ? (occupiedCount / totalUnits) * 100 : 0;

        // 3. Projected Revenue (Sum of monthly rent of active leases)
        const projectedRevenue = activeLeases.reduce((sum, lease) => sum + lease.monthlyRent, 0);

        // 4. Maintenance Tickets
        const { MaintenanceTicket, TicketStatus } = await import('../../maintenance/entities/MaintenanceTicket');
        const openTickets = await this.em.count(MaintenanceTicket, {
            unit: { property: { id } },
            status: { $in: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS] },
        });

        return {
            totalUnits,
            occupiedUnits: occupiedCount,
            vacantUnits: totalUnits - occupiedCount,
            occupancyRate: Math.round(occupancyRate * 10) / 10,
            projectedRevenue,
            openMaintenanceTickets: openTickets,
        };
    }

    async delete(id: string): Promise<void> {
        const property = await this.repo.findOne(id, {
            populate: ['units', 'units.leases'],
        });

        if (!property) {
            throw new Error('Property not found');
        }

        // Check for active leases
        const units = property.units.getItems();
        const activeLeases = units.flatMap((unit) =>
            unit.leases.getItems().filter((lease: any) => lease.status === 'ACTIVE'),
        );

        if (activeLeases.length > 0) {
            throw new Error(
                `No puedes borrar esta propiedad porque tiene ${activeLeases.length} contrato(s) activo(s). ` +
                    `Primero debes terminar o cancelar los contratos.`,
            );
        }

        await this.em.removeAndFlush(property);
    }
}
