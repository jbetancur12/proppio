import { Request, Response, NextFunction } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { ContractTemplatesService } from '../services/contract-templates.service';
import { createContractTemplateSchema, updateContractTemplateSchema } from '../dtos/contract-template.dto';
import { ApiResponse } from '../../../shared/utils/ApiResponse';
import { ValidationError } from '../../../shared/errors/AppError';

export class ContractTemplatesController {

    private getService(): ContractTemplatesService {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('EntityManager not found in context');
        return new ContractTemplatesService(em);
    }

    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const service = this.getService();
            const templates = await service.findAll();
            ApiResponse.success(res, templates);
        } catch (error) {
            next(error);
        }
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const service = this.getService();
            const template = await service.findOne(id);
            ApiResponse.success(res, template);
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const validation = createContractTemplateSchema.safeParse(req.body);
            if (!validation.success) {
                throw new ValidationError(validation.error.issues[0]?.message || 'Datos inválidos');
            }

            const service = this.getService();
            const template = await service.create(validation.data);
            ApiResponse.created(res, template, 'Plantilla creada exitosamente');
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const validation = updateContractTemplateSchema.safeParse(req.body);
            if (!validation.success) {
                throw new ValidationError(validation.error.issues[0]?.message || 'Datos inválidos');
            }

            const service = this.getService();
            const template = await service.update(id, validation.data);
            ApiResponse.success(res, template, 'Plantilla actualizada');
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const service = this.getService();
            await service.delete(id);
            ApiResponse.success(res, null, 'Plantilla eliminada');
        } catch (error) {
            next(error);
        }
    }
}
