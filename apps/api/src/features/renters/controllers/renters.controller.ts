import { Request, Response, NextFunction } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { RentersService } from '../services/renters.service';
import { createRenterSchema, updateRenterSchema } from '../dtos/renter.dto';
import { ApiResponse } from '../../../shared/utils/ApiResponse';
import { AppError, ValidationError } from '../../../shared/errors/AppError';
import { paginationSchema } from '../../../shared/dtos/pagination.dto';

export class RentersController {
    private getService(): RentersService {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('EntityManager not found in context');
        return new RentersService(em);
    }

    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const validation = paginationSchema.safeParse(req.query);
            if (!validation.success) {
                // Should return validation error, but for list we can specific
                // Or just use default if invalid? safeParse validation ensures types
            }
            // If validation fails, use defaults or throw. Let's throw specific error if malformed
            // but for query params usually we ignore extra params.
            // Zod coerce will handle string -> number.

            const query = validation.success ? validation.data : { page: 1, limit: 10 };

            const service = this.getService();
            const result = await service.findAll(query);

            // Use static helper if generic result, or manually
            ApiResponse.paginated(res, result.data, result.meta.total, result.meta.page, result.meta.limit);
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const validation = createRenterSchema.safeParse(req.body);
            if (!validation.success) {
                throw new ValidationError(validation.error.message); // Could format this better
            }

            const service = this.getService();
            const renter = await service.create(validation.data);
            ApiResponse.created(res, renter, 'Inquilino creado exitosamente');
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const validation = updateRenterSchema.safeParse(req.body);
            if (!validation.success) throw new ValidationError(validation.error.message);

            const service = this.getService();
            const renter = await service.update(id, validation.data);
            ApiResponse.success(res, renter, 'Inquilino actualizado');
        } catch (error) {
            next(error);
        }
    }

    async getHistory(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const service = this.getService();
            const history = await service.getHistory(id);
            ApiResponse.success(res, history);
        } catch (error) {
            next(error);
        }
    }
}
