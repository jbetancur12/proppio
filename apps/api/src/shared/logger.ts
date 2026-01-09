import pino from 'pino';

export const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname'
            }
        }
        : undefined, // JSON format in production
    formatters: {
        level: (label) => {
            return { level: label };
        },
    },
});

// Helper to create child loggers with context
export function createLogger(context: Record<string, any>) {
    return logger.child(context);
}
