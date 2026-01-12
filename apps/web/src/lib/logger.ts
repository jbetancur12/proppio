export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
    [key: string]: unknown;
}

class Logger {
    private apiUrl = '/api/logs';

    private log(level: LogLevel, message: string, context?: unknown) {
        // 1. Console Output (Source of truth in Dev)
        if (context) {
             
            console[level](message, context);
        } else {
             
            console[level](message);
        }

        // 2. Send to Backend (Only errors or warnings in Prod, or if configured)
        // For this implementation, we'll send ERRORs only to avoid noise
        if (level === 'error') {
            this.sendToBackend(level, message, context);
        }
    }

    private async sendToBackend(level: LogLevel, message: string, context?: unknown) {
        try {
            // Use fetch to avoid dependencies. Fire and forget.
            const payload = {
                level,
                message,
                context: this.sanitize(context),
                timestamp: new Date().toISOString(),
                url: window.location.href,
                userAgent: navigator.userAgent,
            };

            await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                keepalive: true, // Ensure request is sent even if page unloads
            });
        } catch (err) {
            // Avoid loops
             
            console.warn('Failed to send log to backend', err);
        }
    }

    private sanitize(context: unknown): LogContext | undefined {
        if (context === undefined || context === null) return undefined;

        // Simple sanitization to handle Error objects
        if (context instanceof Error) {
            return {
                name: context.name,
                message: context.message,
                stack: context.stack,
            };
        }

        // Handle objects with potential circular refs (basic)
        try {
            return JSON.parse(JSON.stringify(context)) as LogContext;
        } catch {
            return { error: '[Circular / Non-Serializable]' };
        }
    }

    public info(message: string, context?: unknown) {
        this.log('info', message, context);
    }

    public warn(message: string, context?: unknown) {
        this.log('warn', message, context);
    }

    public error(message: string, context?: unknown) {
        this.log('error', message, context);
    }
}

export const logger = new Logger();
