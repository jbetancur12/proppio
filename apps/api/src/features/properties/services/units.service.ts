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
        const units = await this.unitRepo.find({ property: { id: propertyId } });
        if (units.length === 0) return [];

        const unitIds = units.map(u => u.id);
        const activeLeases = await this.em.find(Lease, {
            unit: { $in: unitIds },
            status: LeaseStatus.ACTIVE
        }, { populate: ['renter'] });

        // Map lease info to units
        // We return a plain object or extended entity. For simplicity in JS/TS, we can return the entity with attached property
        // or map to a DTO. Here we will attach it dynamically.

        return units.map(unit => {
            const lease = activeLeases.find(l => l.unit.id === unit.id);
            return {
                ...wrap(unit).toObject(),
                activeLease: lease ? {
                    id: lease.id,
                    renterId: lease.renter.id,
                    renterName: `${lease.renter.firstName} ${lease.renter.lastName}`,
                    email: lease.renter.email,
                    phone: lease.renter.phone,
                    startDate: lease.startDate,
                    endDate: lease.endDate,
                    monthlyRent: lease.monthlyRent
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
