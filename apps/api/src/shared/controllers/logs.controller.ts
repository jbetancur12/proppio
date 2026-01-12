import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger';

export class LogsController {
    public ingest(req: Request, res: Response, next: NextFunction): void {
        try {
            const { level, message, context, stack } = req.body;

            // Sanitize log level
            const validLevels = ['info', 'warn', 'error', 'debug'];
            const logLevel = validLevels.includes(level) ? level : 'info';

            // Construct log object
            const logData = {
                source: 'frontend',
                ...context,
                stack: stack || undefined,
            };

            // Log using pino
            (logger as any)[logLevel](logData, message || 'Frontend Log');

            res.status(202).send(); // Accepted
        } catch (error) {
            // Fail silently to not impact client
            console.error('Error in logs controller:', error);
            res.status(202).send();
        }
    }
}
