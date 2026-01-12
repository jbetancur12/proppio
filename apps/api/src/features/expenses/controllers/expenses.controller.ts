import { Request, Response, NextFunction } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { ExpensesService } from '../services/expenses.service';
import { createExpenseSchema, updateExpenseSchema } from '../dtos/expense.dto';
import { ApiResponse } from '../../../shared/utils/ApiResponse';
import { ValidationError } from '../../../shared/errors/AppError';
import { paginationSchema } from '../../../shared/dtos/pagination.dto';

export class ExpensesController {
    private getService(): ExpensesService {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('EntityManager not found in context');
        return new ExpensesService(em);
    }

    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const { propertyId } = req.query;
            const validation = paginationSchema.safeParse(req.query);
            const query = validation.success ? validation.data : { page: 1, limit: 10 };

            const service = this.getService();
            const result = await service.findAll({ ...query, propertyId: propertyId as string });

            ApiResponse.paginated(res, result.data, result.meta.total, result.meta.page, result.meta.limit);
        } catch (error) {
            next(error);
        }
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const service = this.getService();
            const expense = await service.findOne(id);
            ApiResponse.success(res, expense);
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const validation = createExpenseSchema.safeParse(req.body);
            if (!validation.success) {
                throw new ValidationError(validation.error.issues[0]?.message || 'Datos inválidos');
            }

            const service = this.getService();
            const expense = await service.create(validation.data);
            ApiResponse.created(res, expense, 'Gasto registrado correctamente');
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const validation = updateExpenseSchema.safeParse(req.body);
            if (!validation.success) {
                throw new ValidationError(validation.error.issues[0]?.message || 'Datos inválidos');
            }

            const service = this.getService();
            const expense = await service.update(id, validation.data);
            ApiResponse.success(res, expense, 'Gasto actualizado');
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const service = this.getService();
            await service.delete(id);
            ApiResponse.success(res, null, 'Gasto eliminado');
        } catch (error) {
            next(error);
        }
    }
}
