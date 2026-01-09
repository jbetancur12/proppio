import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        const user = (req as any).user;

        logger.info({
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration,
            userId: user?.id,
            tenantId: user?.tenantId
        }, 'HTTP Request');
    });

    next();
}
