export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
    private apiUrl = '/api/logs';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private log(level: LogLevel, message: string, context?: any) {
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async sendToBackend(level: LogLevel, message: string, context?: any) {
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private sanitize(context: any): any {
        if (!context) return undefined;
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
            return JSON.parse(JSON.stringify(context));
        } catch {
            return '[Circular / Non-Serializable]';
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public info(message: string, context?: any) {
        this.log('info', message, context);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public warn(message: string, context?: any) {
        this.log('warn', message, context);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public error(message: string, context?: any) {
        this.log('error', message, context);
    }
}

export const logger = new Logger();
