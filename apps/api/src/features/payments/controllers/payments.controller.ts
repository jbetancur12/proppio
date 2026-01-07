import { Request, Response, NextFunction } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { PaymentsService } from '../services/payments.service';
import { createPaymentSchema, updatePaymentSchema } from '../dtos/payment.dto';
import { ApiResponse } from '../../../shared/utils/ApiResponse';
import { ValidationError } from '../../../shared/errors/AppError';

/**
 * PaymentsController - HTTP layer only
 * Following design_guidelines.md section 2.1 (SRP)
 */
export class PaymentsController {

    private getService(): PaymentsService {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('EntityManager not found in context');
        return new PaymentsService(em);
    }

    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const { leaseId } = req.query;
            const service = this.getService();

            const payments = leaseId
                ? await service.findByLease(leaseId as string)
                : await service.findAll();

            ApiResponse.success(res, payments);
        } catch (error) {
            next(error);
        }
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const service = this.getService();
            const payment = await service.findOne(id);
            ApiResponse.success(res, payment);
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const validation = createPaymentSchema.safeParse(req.body);
            if (!validation.success) {
                throw new ValidationError(validation.error.issues[0]?.message || 'Datos inválidos');
            }

            const service = this.getService();
            const payment = await service.create(validation.data);
            ApiResponse.created(res, payment, 'Pago registrado exitosamente');
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const validation = updatePaymentSchema.safeParse(req.body);
            if (!validation.success) {
                throw new ValidationError(validation.error.issues[0]?.message || 'Datos inválidos');
            }

            const service = this.getService();
            const payment = await service.update(id, validation.data);
            ApiResponse.success(res, payment, 'Pago actualizado');
        } catch (error) {
            next(error);
        }
    }

    async getSummary(req: Request, res: Response, next: NextFunction) {
        try {
            const { leaseId } = req.params;
            const service = this.getService();
            const summary = await service.getPaymentSummary(leaseId);
            ApiResponse.success(res, summary);
        } catch (error) {
            next(error);
        }
    }
}
