import { Request, Response, NextFunction } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { AdminService } from '../services/admin.service';
import { TenantProvisioningService } from '../services/tenant-provisioning.service';
import { ApiResponse } from '../../../shared/utils/ApiResponse';

export class AdminController {
    private getAdminService(): AdminService {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('EntityManager not found in context');
        return new AdminService(em);
    }

    private getProvisioningService(): TenantProvisioningService {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('EntityManager not found in context');
        return new TenantProvisioningService(em);
    }

    async listTenants(req: Request, res: Response, next: NextFunction) {
        try {
            const service = this.getAdminService();
            const tenants = await service.getAllTenants();
            ApiResponse.success(res, tenants);
        } catch (error) {
            next(error);
        }
    }

    async getTenant(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const service = this.getAdminService();
            const tenant = await service.getTenantById(id);

            if (!tenant) {
                res.status(404).json({ message: 'Tenant no encontrado' });
                return;
            }

            // Get stats
            const stats = await service.getTenantStats(id);

            ApiResponse.success(res, { tenant, stats });
        } catch (error) {
            next(error);
        }
    }

    async createTenant(req: Request, res: Response, next: NextFunction) {
        try {
            const service = this.getProvisioningService();
            const tenant = await service.createTenant(req.body);
            ApiResponse.success(res, tenant, 'Tenant creado exitosamente');
        } catch (error) {
            next(error);
        }
    }

    async updateTenantStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const service = this.getAdminService();

            if (status === 'ACTIVE') {
                await service.activateTenant(id);
            } else if (status === 'SUSPENDED') {
                await service.suspendTenant(id);
            } else {
                res.status(400).json({ message: 'Estado inválido' });
                return;
            }

            ApiResponse.success(res, null, `Tenant ${status === 'ACTIVE' ? 'activado' : 'suspendido'} exitosamente`);
        } catch (error) {
            next(error);
        }
    }

    async listUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const service = this.getAdminService();
            const users = await service.getAllUsers();
            ApiResponse.success(res, users);
        } catch (error) {
            next(error);
        }
    }

    async getGlobalMetrics(req: Request, res: Response, next: NextFunction) {
        try {
            const service = this.getAdminService();
            const metrics = await service.getGlobalMetrics();
            ApiResponse.success(res, metrics);
        } catch (error) {
            next(error);
        }
    }
}
