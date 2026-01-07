import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { requestContext, UserContext } from '../utils/RequestContext';
import { RequestContext as MikroContext } from '@mikro-orm/core';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ message: 'No authorization header' });
        return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as UserContext;

        // Validate required fields in the token
        if (!decoded.tenantId || !decoded.userId) {
            res.status(401).json({ message: 'Invalid token payload' });
            return;
        }

        // Get EntityManager for DB operations
        const em = MikroContext.getEntityManager();
        if (!em) {
            res.status(500).json({ message: 'Internal server error' });
            return;
        }

        // KILL SWITCH: Check tenant status
        const { Tenant, TenantStatus } = await import('../../features/tenants/entities/Tenant');
        const tenant = await em.findOne(Tenant, { id: decoded.tenantId });

        if (!tenant) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'TENANT_NOT_FOUND',
                    message: 'Tenant not found'
                },
                timestamp: new Date().toISOString()
            });
            return;
        }

        if (tenant.status === TenantStatus.SUSPENDED) {
            res.status(402).json({
                success: false,
                error: {
                    code: 'SUBSCRIPTION_REQUIRED',
                    message: 'Tu suscripción ha sido suspendida. Por favor contacta a soporte.'
                },
                timestamp: new Date().toISOString()
            });
            return;
        }

        // CRITICAL: Set PostgreSQL RLS variable for Row Level Security
        // This enables the third layer of multi-tenancy defense
        await em.getConnection().execute(
            `SET LOCAL app.current_tenant = '${decoded.tenantId}'`
        );

        // Wrap the next() call in the AsyncLocalStorage context
        requestContext.run(decoded, () => {
            next();
        });

    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
        return;
    }
};
