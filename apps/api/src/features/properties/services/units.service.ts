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
                populate: ['leases', 'leases.renter', 'leases.payments'] as any,
                populateWhere: {
                    leases: { status: LeaseStatus.ACTIVE },
                },
            },
        );

        if (units.length === 0) return [];

        const today = new Date();
        const warningDate = new Date();
        warningDate.setDate(today.getDate() + 60);

        return units.map((unit) => {
            // Since we filtered in the query, the collection only contains active leases (max 1)
            const activeLease = unit.leases.getItems()[0];

            const alerts: string[] = [];

            if (activeLease) {
                // Check Expiry
                const endDate = new Date(activeLease.endDate);
                if (endDate <= warningDate && endDate >= today) {
                    alerts.push('EXPIRING_LEASE');
                }

                // Check Pending Payments
                // We loaded payments for the active lease, so we can check them
                const hasPendingPayments = activeLease.payments.getItems().some((p) => p.status === 'PENDING');
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
                          renterId: activeLease.renter.id,
                          renterName: `${activeLease.renter.firstName} ${activeLease.renter.lastName}`,
                          email: activeLease.renter.email,
                          phone: activeLease.renter.phone,
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
