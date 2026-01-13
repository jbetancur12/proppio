import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { logger } from '../logger';

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
    const error = err;

    // Set default values
    let statusCode = 500;
    let message = 'Internal Server Error';
    let code = 'INTERNAL_ERROR';

    // Log error with full context
    const logData: any = {
        err: {
            name: error.name,
            message: error.message,
            stack: error.stack,
        },
        method: req.method,
        path: req.path,
        query: req.query,
        params: req.params,
        body: req.body,
        userId: (req as any).user?.id,
        tenantId: (req as any).user?.tenantId,
    };

    if (error instanceof AppError) {
        statusCode = error.statusCode;
        message = error.message;
        code = error.code || 'APP_ERROR';
        logData.statusCode = statusCode;
        logData.code = code;
        logData.isOperational = error.isOperational;

        // Log as warning for operational errors
        logger.warn(logData, `Operational error: ${message}`);
    } else {
        // Log as error for unexpected errors
        logger.error(logData, `Unexpected error: ${message}`);
    }

    res.status(statusCode).json({
        success: false,
        error: {
            code,
            message,
        },
        timestamp: new Date().toISOString(),
    });
};
