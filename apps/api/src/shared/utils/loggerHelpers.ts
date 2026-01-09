import { logger } from '../logger';
import { Request } from 'express';

/**
 * Logs controller errors with context
 */
export function logControllerError(
    error: any,
    context: {
        controller: string;
        method: string;
        req?: Request;
        additionalData?: Record<string, any>;
    }
) {
    const logData: any = {
        err: error,
        controller: context.controller,
        method: context.method,
        ...context.additionalData
    };

    if (context.req) {
        logData.path = context.req.path;
        logData.userId = (context.req as any).user?.id;
        logData.tenantId = (context.req as any).user?.tenantId;
    }

    logger.error(logData, `Controller error: ${context.controller}.${context.method}`);
}
