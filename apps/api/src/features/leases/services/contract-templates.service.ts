import { EntityManager } from '@mikro-orm/core';
import { ContractTemplate } from '../entities/ContractTemplate';
import { CreateContractTemplateDto, UpdateContractTemplateDto } from '../dtos/contract-template.dto';
import { ValidationError } from '../../../shared/errors/AppError';

export class ContractTemplatesService {
    constructor(private readonly em: EntityManager) { }

    async findAll(): Promise<ContractTemplate[]> {
        return this.em.find(ContractTemplate, {});
    }

    async findOne(id: string): Promise<ContractTemplate> {
        return this.em.findOneOrFail(ContractTemplate, { id });
    }

    async create(data: CreateContractTemplateDto): Promise<ContractTemplate> {
        const count = await this.em.count(ContractTemplate);
        if (count >= 2) {
            throw new ValidationError('Solo se permiten crear un máximo de 2 plantillas.');
        }

        const template = new ContractTemplate();
        Object.assign(template, data);
        await this.em.persistAndFlush(template);
        return template;
    }

    async update(id: string, data: UpdateContractTemplateDto): Promise<ContractTemplate> {
        const template = await this.findOne(id);
        Object.assign(template, data);
        await this.em.flush();
        return template;
    }

    async delete(id: string): Promise<void> {
        const template = await this.findOne(id);
        await this.em.removeAndFlush(template);
    }
}
