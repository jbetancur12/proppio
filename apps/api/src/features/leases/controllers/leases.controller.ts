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

    private getService(req?: Request): LeasesService {
        let em = RequestContext.getEntityManager();

        // Fallback: Check if EM is attached to request (fixing Multer context loss)
        if (!em && req && (req as any).em) {
            em = (req as any).em;
        }

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
            // Capture service (and EM context) early to prevent Context loss during async storage ops
            // Pass req to use attached fallback EM if needed
            const service = this.getService(req);
            const { id } = req.params;
            const file = req.file;
            if (!file) throw new ValidationError('No se proporcionó ningún archivo');

            // Upload to S3/MinIO
            const bucketName = process.env.STORAGE_BUCKET || 'rent-manager-documents';
            await storageService.ensureBucket(bucketName);

            const key = `leases/${id}/contract.pdf`; // Standard path
            await storageService.uploadBuffer(bucketName, key, file.buffer, file.mimetype);

            // Update lease record
            const lease = await service.updateContractPdf(id, key);

            ApiResponse.success(res, lease, 'Contrato subido exitosamente');
        } catch (error) {
            next(error);
        }
    }

    // Rent Increase Methods
    async previewIncreases(req: Request, res: Response, next: NextFunction) {
        try {
            const { increasePercentage } = req.query;
            const { RentIncreaseService } = await import('../services/rent-increase.service');
            const service = new RentIncreaseService(RequestContext.getEntityManager()!);

            const previews = await service.previewIncreases(Number(increasePercentage));
            ApiResponse.success(res, previews);
        } catch (error) {
            next(error);
        }
    }

    async applyIncrease(req: Request, res: Response, next: NextFunction) {
        try {
            const { RentIncreaseService } = await import('../services/rent-increase.service');
            const service = new RentIncreaseService(RequestContext.getEntityManager()!);

            await service.applyIncrease(req.body);
            ApiResponse.success(res, null, 'Aumento aplicado exitosamente');
        } catch (error) {
            next(error);
        }
    }

    async bulkApplyIncreases(req: Request, res: Response, next: NextFunction) {
        try {
            const { RentIncreaseService } = await import('../services/rent-increase.service');
            const service = new RentIncreaseService(RequestContext.getEntityManager()!);

            await service.bulkApplyIncreases(req.body);
            ApiResponse.success(res, null, `${req.body.increases.length} aumentos aplicados exitosamente`);
        } catch (error) {
            next(error);
        }
    }

    async getIPC(req: Request, res: Response, next: NextFunction) {
        try {
            const { year } = req.params;
            const { RentIncreaseService } = await import('../services/rent-increase.service');
            const service = new RentIncreaseService(RequestContext.getEntityManager()!);

            const ipc = await service.getIPCForYear(Number(year));
            ApiResponse.success(res, { year: Number(year), ipcRate: ipc });
        } catch (error) {
            next(error);
        }
    }

    async setIPC(req: Request, res: Response, next: NextFunction) {
        try {
            const { year, ipcRate } = req.body;
            const { RentIncreaseService } = await import('../services/rent-increase.service');
            const service = new RentIncreaseService(RequestContext.getEntityManager()!);

            await service.setIPCForYear(Number(year), Number(ipcRate));
            ApiResponse.success(res, null, `IPC ${year} configurado: ${ipcRate}%`);
        } catch (error) {
            next(error);
        }
    }
}
