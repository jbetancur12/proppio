import { EntityManager, EntityRepository, wrap } from '@mikro-orm/core';
import { UnitEntity } from '../entities/Unit';
import { PropertyEntity } from '../entities/Property';
import { CreateUnitDto, UpdateUnitDto } from '../dtos/unit.dto';

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
        unit.property = property;

        await this.em.persistAndFlush(unit);
        return unit;
    }

    async findAllByProperty(propertyId: string) {
        return this.unitRepo.find({ property: { id: propertyId } });
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
