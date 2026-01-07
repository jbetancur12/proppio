import { Request, Response, NextFunction } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { StatsService } from '../services/stats.service';
import { ApiResponse } from '../../../shared/utils/ApiResponse';

/**
 * StatsController - Dashboard statistics endpoint
 */
export class StatsController {

    private getService(): StatsService {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('EntityManager not found in context');
        return new StatsService(em);
    }

    async getDashboard(req: Request, res: Response, next: NextFunction) {
        try {
            const service = this.getService();
            const stats = await service.getDashboardStats();
            ApiResponse.success(res, stats);
        } catch (error) {
            next(error);
        }
    }
}
