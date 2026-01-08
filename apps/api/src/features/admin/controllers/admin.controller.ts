import { Request, Response, NextFunction } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { AdminService } from '../services/admin.service';
import { TenantProvisioningService } from '../services/tenant-provisioning.service';
import { ApiResponse } from '../../../shared/utils/ApiResponse';
import { AuditLogService } from '../services/audit-log.service';
import { MetricsService } from '../services/metrics.service';

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

    private getAuditService(): AuditLogService {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('EntityManager not found in context');
        return new AuditLogService(em);
    }

    private getMetricsService(): MetricsService {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('EntityManager not found in context');
        return new MetricsService(em);
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

    async updateTenantConfig(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { config } = req.body;
            const service = this.getAdminService();

            await service.updateTenantConfig(id, config);
            ApiResponse.success(res, null, 'Configuración actualizada exitosamente');
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

    async getFinancialMetrics(req: Request, res: Response, next: NextFunction) {
        try {
            const service = this.getMetricsService();
            const metrics = await service.getFinancialMetrics();
            ApiResponse.success(res, metrics);
        } catch (error) {
            next(error);
        }
    }

    async getAuditLogs(req: Request, res: Response, next: NextFunction) {
        try {
            const { tenantId, userId, action, startDate, endDate, limit, offset } = req.query;
            const service = this.getAuditService();

            const result = await service.getLogs({
                tenantId: tenantId as string,
                userId: userId as string,
                action: action as string,
                startDate: startDate ? new Date(startDate as string) : undefined,
                endDate: endDate ? new Date(endDate as string) : undefined,
                limit: limit ? Number(limit) : 20,
                offset: offset ? Number(offset) : 0
            });

            ApiResponse.success(res, result);
        } catch (error) {
            next(error);
        }
    }
}
