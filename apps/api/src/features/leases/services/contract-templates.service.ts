import { EntityManager } from '@mikro-orm/core';
import { ContractTemplate } from '../entities/ContractTemplate';
import { CreateContractTemplateDto, UpdateContractTemplateDto } from '../dtos/contract-template.dto';
import { ValidationError } from '../../../shared/errors/AppError';
import { MAX_CONTRACT_TEMPLATES } from '../../../shared/constants';

export class ContractTemplatesService {
    constructor(private readonly em: EntityManager) {}

    async findAll(): Promise<ContractTemplate[]> {
        return this.em.find(ContractTemplate, {});
    }

    async findOne(id: string): Promise<ContractTemplate> {
        return this.em.findOneOrFail(ContractTemplate, { id });
    }

    async create(data: CreateContractTemplateDto): Promise<ContractTemplate> {
        const count = await this.em.count(ContractTemplate);
        if (count >= MAX_CONTRACT_TEMPLATES) {
            throw new ValidationError(`Solo se permiten crear un máximo de ${MAX_CONTRACT_TEMPLATES} plantillas.`);
        }

        const template = new ContractTemplate();
        Object.assign(template, data);
        await this.em.persistAndFlush(template);

        // Audit Log
        try {
            const auditService = new (await import('../../admin/services/audit-log.service')).AuditLogService(this.em);
            await auditService.log({
                action: 'CREATE_TEMPLATE',
                resourceType: 'Template',
                resourceId: template.id,
                newValues: data,
            });
        } catch (error) {
            console.error('Audit log failed for create template:', error);
        }

        return template;
    }

    async update(id: string, data: UpdateContractTemplateDto): Promise<ContractTemplate> {
        const template = await this.findOne(id);
        const oldValues = { name: template.name, content: template.content };
        Object.assign(template, data);
        await this.em.flush();

        // Audit Log
        try {
            const auditService = new (await import('../../admin/services/audit-log.service')).AuditLogService(this.em);
            await auditService.log({
                action: 'UPDATE_TEMPLATE',
                resourceType: 'Template',
                resourceId: template.id,
                oldValues,
                newValues: data,
            });
        } catch (error) {
            console.error('Audit log failed for update template:', error);
        }

        return template;
    }

    async delete(id: string): Promise<void> {
        const template = await this.findOne(id);
        const templateData = { id: template.id, name: template.name };

        await this.em.removeAndFlush(template);

        // Audit Log
        try {
            const auditService = new (await import('../../admin/services/audit-log.service')).AuditLogService(this.em);
            await auditService.log({
                action: 'DELETE_TEMPLATE',
                resourceType: 'Template',
                resourceId: templateData.id,
                oldValues: templateData,
            });
        } catch (error) {
            console.error('Audit log failed for delete template:', error);
        }
    }
}
