import { Request, Response, NextFunction } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { UnitsService } from '../services/units.service';
import { createUnitSchema, updateUnitSchema } from '../dtos/unit.dto';
import { ApiResponse } from '../../../shared/utils/ApiResponse';
import { AppError } from '../../../shared/errors/AppError';

export class UnitsController {

    private getService(): UnitsService {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('EntityManager not found in context');
        return new UnitsService(em);
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const validation = createUnitSchema.safeParse(req.body);
            if (!validation.success) {
                // In a real app, map ZodError to a clean format
                throw new AppError('Validation failed', 400);
            }

            const service = this.getService();
            const unit = await service.create(validation.data);
            ApiResponse.created(res, unit, 'Unit created successfully');
        } catch (error) {
            next(error);
        }
    }

    async listByProperty(req: Request, res: Response, next: NextFunction) {
        try {
            const { propertyId } = req.params;
            if (!propertyId) throw new AppError('Property ID required', 400);

            const service = this.getService();
            const units = await service.findAllByProperty(propertyId);
            ApiResponse.success(res, units);
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const validation = updateUnitSchema.safeParse(req.body);
            if (!validation.success) {
                // In a real app, map ZodError to a clean format
                throw new AppError('Validation failed', 400);
            }

            const service = this.getService();
            const unit = await service.update(id, validation.data);
            ApiResponse.success(res, unit, 'Unit updated successfully');
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const service = this.getService();
            await service.delete(id);
            ApiResponse.noContent(res);
        } catch (error) {
            next(error);
        }
    }
}
