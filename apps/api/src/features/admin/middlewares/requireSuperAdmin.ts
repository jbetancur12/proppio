import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../../../shared/errors/AppError';

/**
 * Middleware to require Super Admin role
 */
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
    const user = (req as any).user; // Set by authMiddleware

    if (!user || user.globalRole !== 'SUPER_ADMIN') {
        throw new UnauthorizedError('Se requiere rol de Super Admin');
    }

    next();
}
