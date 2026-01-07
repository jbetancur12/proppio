import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { PropertyEntity } from '../entities/Property';
import { CreatePropertyDto, UpdatePropertyDto } from '../dtos/property.dto';

export class PropertiesService {
    private repo: EntityRepository<PropertyEntity>;

    constructor(private em: EntityManager) {
        this.repo = em.getRepository(PropertyEntity);
    }

    async findAll() {
        return this.repo.findAll();
    }

    async findOne(id: string) {
        return this.repo.findOneOrFail({ id });
    }

    async create(dto: CreatePropertyDto) {
        const property = new PropertyEntity();
        property.name = dto.name;
        property.address = dto.address;

        await this.em.persistAndFlush(property);
        return property;
    }

    async update(id: string, dto: UpdatePropertyDto) {
        const property = await this.findOne(id);

        if (dto.name) property.name = dto.name;
        if (dto.address) property.address = dto.address;

        await this.em.flush();
        return property;
    }
}
