import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = pino({
    level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
    transport: isDevelopment
        ? {
              target: 'pino-pretty',
              options: {
                  colorize: true,
                  translateTime: 'HH:MM:ss Z',
                  ignore: 'pid,hostname',
              },
          }
        : undefined,
    formatters: {
        level: (label) => {
            return { level: label };
        },
    },
});

// Helper methods for common logging patterns
export const logError = (message: string, error: unknown, context?: Record<string, unknown>) => {
    logger.error({
        message,
        error:
            error instanceof Error
                ? {
                      name: error.name,
                      message: error.message,
                      stack: error.stack,
                  }
                : error,
        ...context,
    });
};

export const logInfo = (message: string, context?: Record<string, unknown>) => {
    logger.info({ message, ...context });
};

export const logWarn = (message: string, context?: Record<string, unknown>) => {
    logger.warn({ message, ...context });
};

export const logDebug = (message: string, context?: Record<string, unknown>) => {
    logger.debug({ message, ...context });
};
