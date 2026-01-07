import { Response } from 'express';

export class ApiResponse {
    static success<T>(res: Response, data: T, message?: string, statusCode: number = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
            timestamp: new Date().toISOString(),
        });
    }

    static created<T>(res: Response, data: T, message: string = "Resource created details") {
        return ApiResponse.success(res, data, message, 201);
    }

    static noContent(res: Response) {
        return res.status(204).send();
    }
}
