import { Request, Response, NextFunction } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { LeasesService } from '../services/leases.service';
import { createLeaseSchema, updateLeaseSchema } from '../dtos/lease.dto';
import { ApiResponse } from '../../../shared/utils/ApiResponse';
import { ValidationError } from '../../../shared/errors/AppError';

import { storageService } from '../../../shared/services/storage.service';

/**
 * LeasesController - HTTP layer only, delegates to service
 * Following design_guidelines.md section 2.1 (SRP)
 */
export class LeasesController {

    private getService(): LeasesService {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('EntityManager not found in context');
        return new LeasesService(em);
    }

    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const service = this.getService();
            const leases = await service.findAll();
            ApiResponse.success(res, leases);
        } catch (error) {
            next(error);
        }
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const service = this.getService();
            const lease = await service.findOne(id);
            ApiResponse.success(res, lease);
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const validation = createLeaseSchema.safeParse(req.body);
            if (!validation.success) {
                throw new ValidationError(validation.error.issues[0]?.message || 'Datos inválidos');
            }

            const service = this.getService();
            const lease = await service.create(validation.data);
            ApiResponse.created(res, lease, 'Contrato creado exitosamente');
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const validation = updateLeaseSchema.safeParse(req.body);
            if (!validation.success) {
                throw new ValidationError(validation.error.issues[0]?.message || 'Datos inválidos');
            }

            const service = this.getService();
            const lease = await service.update(id, validation.data);
            ApiResponse.success(res, lease, 'Contrato actualizado');
        } catch (error) {
            next(error);
        }
    }

    async activate(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const service = this.getService();
            const lease = await service.activate(id);
            ApiResponse.success(res, lease, 'Contrato activado');
        } catch (error) {
            next(error);
        }
    }

    async terminate(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const service = this.getService();
            const lease = await service.terminate(id);
            ApiResponse.success(res, lease, 'Contrato terminado');
        } catch (error) {
            next(error);
        }
    }

    async getExpiring(req: Request, res: Response, next: NextFunction) {
        try {
            const days = req.query.days ? parseInt(req.query.days as string) : 60;
            const service = this.getService();
            const leases = await service.findExpiring(days);
            ApiResponse.success(res, leases);
        } catch (error) {
            next(error);
        }
    }

    async uploadContract(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const file = req.file;
            if (!file) throw new ValidationError('No se proporcionó ningún archivo');

            // Upload to S3/MinIO
            const bucketName = process.env.STORAGE_BUCKET || 'rent-manager-documents';
            await storageService.ensureBucket(bucketName);

            const key = `leases/${id}/contract.pdf`; // Standard path
            await storageService.uploadBuffer(bucketName, key, file.buffer, file.mimetype);

            // Update lease record
            const service = this.getService();
            const lease = await service.updateContractPdf(id, key);

            ApiResponse.success(res, lease, 'Contrato subido exitosamente');
        } catch (error) {
            next(error);
        }
    }
}
