import { EntityManager, EntityRepository, wrap } from '@mikro-orm/core';
import { UnitEntity } from '../entities/Unit';
import { PropertyEntity } from '../entities/Property';
import { CreateUnitDto, UpdateUnitDto } from '../dtos/unit.dto';
import { Lease, LeaseStatus } from '../../leases/entities/Lease';

export class UnitsService {
    private unitRepo: EntityRepository<UnitEntity>;
    private propertyRepo: EntityRepository<PropertyEntity>;

    constructor(private em: EntityManager) {
        this.unitRepo = em.getRepository(UnitEntity);
        this.propertyRepo = em.getRepository(PropertyEntity);
    }

    async create(dto: CreateUnitDto) {
        // Verify property exists and belongs to tenant (automatic via filter)
        const property = await this.propertyRepo.findOneOrFail({ id: dto.propertyId });

        const unit = new UnitEntity();
        unit.name = dto.name;
        unit.type = dto.type;
        unit.area = dto.area;
        unit.bedrooms = dto.bedrooms;
        unit.bathrooms = dto.bathrooms;
        unit.baseRent = dto.baseRent;
        unit.property = property;

        await this.em.persistAndFlush(unit);

        // Audit Log
        try {
            const auditService = new (await import('../../admin/services/audit-log.service')).AuditLogService(this.em);
            await auditService.log({
                action: 'CREATE_UNIT',
                resourceType: 'Unit',
                resourceId: unit.id,
                newValues: dto,
            });
        } catch (error) {
            console.error('Audit log failed for create unit:', error);
        }

        return unit;
    }

    async findAllByProperty(propertyId: string) {
        // Optimize: Use populateWhere to only fetch ACTIVE leases
        // This avoids loading historical leases and reduces memory/CPU usage
        const units = await this.unitRepo.find(
            { property: { id: propertyId } },
            {
                // Removed 'as any' - assuming relations are correctly typed in Entity
                populate: ['leases', 'leases.renter', 'leases.payments'],
                populateWhere: {
                    leases: { status: LeaseStatus.ACTIVE },
                },
            },
        );

        if (units.length === 0) return [];

        const today = new Date();
        const warningDate = new Date();
        warningDate.setDate(today.getDate() + 60);

        // Date Normalization for robust comparison
        today.setHours(0, 0, 0, 0);
        warningDate.setHours(23, 59, 59, 999);

        return units.map((unit) => {
            // Defensive: Check if collection is initialized
            const activeLease = unit.leases.isInitialized() ? unit.leases.getItems()[0] : undefined;

            const alerts: string[] = [];

            if (activeLease) {
                // Check Expiry with normalized dates
                const endDate = new Date(activeLease.endDate);
                endDate.setHours(0, 0, 0, 0);

                if (endDate <= warningDate && endDate >= today) {
                    alerts.push('EXPIRING_LEASE');
                }

                // Check Pending Payments
                // Defensive check + length check
                // We loaded all payments for the active lease, so we filter in memory
                const hasPendingPayments =
                    activeLease.payments.isInitialized() &&
                    activeLease.payments.getItems().some((p) => p.status === 'PENDING');

                if (hasPendingPayments) {
                    alerts.push('PENDING_PAYMENTS');
                }
            }

            return {
                ...wrap(unit).toObject(),
                alerts,
                activeLease: activeLease
                    ? {
                          id: activeLease.id,
                          // Safe access to renter (it might be null in edge cases)
                          renterId: activeLease.renter?.id ?? null,
                          renterName: activeLease.renter
                              ? `${activeLease.renter.firstName} ${activeLease.renter.lastName}`
                              : null,
                          email: activeLease.renter?.email ?? null,
                          phone: activeLease.renter?.phone ?? null,
                          startDate: activeLease.startDate,
                          endDate: activeLease.endDate,
                          monthlyRent: activeLease.monthlyRent,
                      }
                    : null,
            };
        });
    }

    async update(id: string, dto: UpdateUnitDto) {
        const unit = await this.unitRepo.findOneOrFail({ id });
        const oldValues = { ...wrap(unit).toObject() };
        wrap(unit).assign(dto);
        await this.em.flush();

        // Audit Log
        try {
            const auditService = new (await import('../../admin/services/audit-log.service')).AuditLogService(this.em);
            await auditService.log({
                action: 'UPDATE_UNIT',
                resourceType: 'Unit',
                resourceId: unit.id,
                oldValues: { name: oldValues.name, type: oldValues.type, baseRent: oldValues.baseRent },
                newValues: dto,
            });
        } catch (error) {
            console.error('Audit log failed for update unit:', error);
        }

        return unit;
    }

    async delete(id: string) {
        const unit = await this.unitRepo.findOneOrFail({ id });
        const unitData = { id: unit.id, name: unit.name, propertyId: unit.property.id };

        await this.em.removeAndFlush(unit);

        // Audit Log
        try {
            const auditService = new (await import('../../admin/services/audit-log.service')).AuditLogService(this.em);
            await auditService.log({
                action: 'DELETE_UNIT',
                resourceType: 'Unit',
                resourceId: unitData.id,
                oldValues: unitData,
            });
        } catch (error) {
            console.error('Audit log failed for delete unit:', error);
        }
    }
}
