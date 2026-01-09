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

        // Get EntityManager for DB operations
        const em = MikroContext.getEntityManager();
        if (!em) {
            res.status(500).json({ message: 'Internal server error' });
            return;
        }

        // Validate required fields in the token
        if (decoded.globalRole === 'SUPER_ADMIN') {
            // Super Admin: No tenantId required, skip tenant validation
            // Check for impersonation header
            const impersonateTenant = req.headers['x-impersonate-tenant'] as string;

            if (impersonateTenant) {
                // Validate tenant exists
                const { Tenant } = await import('../../features/tenants/entities/Tenant');
                const tenant = await em.findOne(Tenant, { id: impersonateTenant });

                if (!tenant) {
                    res.status(401).json({
                        success: false,
                        error: {
                            code: 'INVALID_TENANT',
                            message: 'Tenant de impersonación no válido'
                        }
                    });
                    return;
                }

                // Set tenantId for impersonation
                decoded.tenantId = impersonateTenant;

                // RLS implementation removed as it requires transaction context
                // and we handle tenant isolation via TenantSubscriber and filters
            }

            // Continue without tenant context if not impersonating
            (req as any).user = decoded; // Attach to req for legacy middleware
            requestContext.run(decoded, () => {
                next();
            });
            return;
        }

        // Regular user: tenantId is required
        if (!decoded.tenantId || !decoded.userId) {
            res.status(401).json({ message: 'Invalid token payload' });
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

        // Crits: RLS variable setup removed
        // We handle multi-tenancy via TenantSubscriber and MikroORM filters
        // The SET LOCAL command caused warnings because it wasn't in a transaction block

        (req as any).user = decoded; // Attach to req for legacy middleware

        // Wrap the next() call in the AsyncLocalStorage context
        requestContext.run(decoded, () => {
            next();
        });

    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
        return;
    }
};
