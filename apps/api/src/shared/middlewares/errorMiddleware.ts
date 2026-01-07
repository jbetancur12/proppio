import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
    let error = err;

    // Set default values
    let statusCode = 500;
    let message = 'Internal Server Error';
    let code = 'INTERNAL_ERROR';

    if (error instanceof AppError) {
        statusCode = error.statusCode;
        message = error.message;
        code = error.code || 'APP_ERROR';
    } else {
        console.error("Unhandled Error:", err);
    }

    // Handle specific errors (e.g., MikroORM, Zod) if needed
    // if (err instanceof UniqueConstraintViolationException) ...

    res.status(statusCode).json({
        success: false,
        error: {
            code,
            message,
        },
        timestamp: new Date().toISOString(),
    });
};
