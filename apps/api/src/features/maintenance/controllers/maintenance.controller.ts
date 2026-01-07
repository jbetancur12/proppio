import { Request, Response, NextFunction } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { MaintenanceService } from '../services/maintenance.service';
import { createTicketSchema, updateTicketSchema } from '../dtos/maintenance.dto';
import { ApiResponse } from '../../../shared/utils/ApiResponse';
import { ValidationError } from '../../../shared/errors/AppError';

export class MaintenanceController {

    private getService(): MaintenanceService {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('EntityManager not found in context');
        return new MaintenanceService(em);
    }

    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const { status, unitId } = req.query;
            const service = this.getService();
            const tickets = await service.findAll({
                status: status as string,
                unitId: unitId as string
            });
            ApiResponse.success(res, tickets);
        } catch (error) {
            next(error);
        }
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const service = this.getService();
            const ticket = await service.findOne(id);
            ApiResponse.success(res, ticket);
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const validation = createTicketSchema.safeParse(req.body);
            if (!validation.success) {
                throw new ValidationError(validation.error.issues[0]?.message || 'Datos inválidos');
            }

            const service = this.getService();
            const ticket = await service.create(validation.data);
            ApiResponse.created(res, ticket, 'Ticket creado exitosamente');
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const validation = updateTicketSchema.safeParse(req.body);
            if (!validation.success) {
                throw new ValidationError(validation.error.issues[0]?.message || 'Datos inválidos');
            }

            const service = this.getService();
            const ticket = await service.update(id, validation.data);
            ApiResponse.success(res, ticket, 'Ticket actualizado');
        } catch (error) {
            next(error);
        }
    }
}
