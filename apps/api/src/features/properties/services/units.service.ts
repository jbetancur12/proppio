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
        return unit;
    }

    async findAllByProperty(propertyId: string) {
        // Use deep populate to get everything in one query (or few optimized queries)
        const units = await this.unitRepo.find({ property: { id: propertyId } }, {
            populate: ['leases', 'leases.renter', 'leases.payments'] as any
        });

        if (units.length === 0) return [];

        const today = new Date();
        const warningDate = new Date();
        warningDate.setDate(today.getDate() + 60);

        return units.map(unit => {
            // Find active lease from populated collection
            const leases = unit.leases.getItems();
            let activeLease: Lease | undefined;

            const alerts: string[] = [];
            let hasPendingPayments = false;
            let hasExpiringLeases = false;

            for (const lease of leases) {
                if (lease.status === LeaseStatus.ACTIVE) {
                    activeLease = lease;

                    // Check Expiry
                    const endDate = new Date(lease.endDate);
                    if (endDate <= warningDate && endDate >= today) {
                        hasExpiringLeases = true;
                    }

                    // Check Pending Payments
                    const payments = lease.payments.getItems();
                    const pending = payments.some(p => p.status === 'PENDING');
                    if (pending) {
                        hasPendingPayments = true;
                    }
                }
            }

            if (hasPendingPayments) alerts.push('PENDING_PAYMENTS');
            if (hasExpiringLeases) alerts.push('EXPIRING_LEASE');

            return {
                ...wrap(unit).toObject(),
                alerts,
                activeLease: activeLease ? {
                    id: activeLease.id,
                    renterId: activeLease.renter.id,
                    renterName: `${activeLease.renter.firstName} ${activeLease.renter.lastName}`,
                    email: activeLease.renter.email,
                    phone: activeLease.renter.phone,
                    startDate: activeLease.startDate,
                    endDate: activeLease.endDate,
                    monthlyRent: activeLease.monthlyRent
                } : null
            };
        });
    }

    async update(id: string, dto: UpdateUnitDto) {
        const unit = await this.unitRepo.findOneOrFail({ id });
        wrap(unit).assign(dto);
        await this.em.flush();
        return unit;
    }

    async delete(id: string) {
        const unit = await this.unitRepo.findOneOrFail({ id });
        await this.em.removeAndFlush(unit);
    }
}
