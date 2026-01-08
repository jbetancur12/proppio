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
}
