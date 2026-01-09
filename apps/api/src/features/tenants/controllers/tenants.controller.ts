import { Request, Response, NextFunction } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { TenantsService } from '../services/tenants.service';

export class TenantsController {
    private getService(): TenantsService {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('EntityManager not found in context');
        return new TenantsService(em);
    }

    async getSubscription(req: Request, res: Response, next: NextFunction) {
        try {
            const tenantId = (req as any).user?.tenantId;
            if (!tenantId) {
                res.status(400).json({ error: 'Usuario no pertenece a un tenant' });
                return;
            }

            const result = await this.getService().getSubscription(tenantId);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
}
