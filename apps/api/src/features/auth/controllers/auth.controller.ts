import { Request, Response, NextFunction } from 'express';
import { RequestContext } from '@mikro-orm/core';
import { AuthService } from '../services/auth.service';
import { loginSchema } from '../dtos/auth.dto';

export class AuthController {
    private getService(): AuthService {
        const em = RequestContext.getEntityManager();
        if (!em) throw new Error('EntityManager not found in context');
        return new AuthService(em);
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const validation = loginSchema.safeParse(req.body);
            if (!validation.success) {
                res.status(400).json({ errors: validation.error.errors });
                return;
            }

            const result = await this.getService().login(validation.data);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
    async changePassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                res.status(400).json({ error: 'Faltan datos requeridos (currentPassword, newPassword)' });
                return;
            }

            // Get userId from authenticated request
            const userId = (req as any).user?.userId;
            if (!userId) {
                res.status(401).json({ error: 'No autenticado' });
                return;
            }

            const result = await this.getService().changePassword(userId, { currentPassword, newPassword });
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
}
