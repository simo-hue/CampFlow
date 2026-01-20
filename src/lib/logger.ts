/**
 * Universal Logger Utility
 * Use this logger instead of console.log/error directly.
 * 
 * Usage:
 * import { logger } from '@/lib/logger';
 * 
 * logger.info('User logged in', { userId: '123' });
 * logger.error('Failed to fetch data', { error: err });
 */

type LogLevel = 'info' | 'warn' | 'error';

interface LogMeta {
    [key: string]: any;
}

class Logger {
    private isDev = process.env.NODE_ENV === 'development';

    private log(level: LogLevel, message: string, meta?: LogMeta) {
        const timestamp = new Date().toISOString();

        // 1. Console Output (Always)
        if (this.isDev) {
            // Pretty print in development
            const color = level === 'error' ? '\x1b[31m' : level === 'warn' ? '\x1b[33m' : '\x1b[36m';
            const reset = '\x1b[0m';
            console.log(`${color}[${level.toUpperCase()}]${reset} ${message}`, meta ? meta : '');
        } else {
            // JSON format in production (better for Vercel logs)
            console.log(JSON.stringify({
                level,
                message,
                timestamp,
                ...meta,
            }));
        }

        // 2. Persist to DB (Only for Warn/Error)
        // We call the server action. It works from both Server and Client components.
        if ((level === 'warn' || level === 'error')) {
            this.persistLog(level, message, meta);
        }
    }

    private async persistLog(level: LogLevel, message: string, meta?: LogMeta) {
        try {
            // Dynamically import the server action/function to avoid bundling issues on client
            // This is a bit of a trick to keep the logger universal.
            const { logToDb } = await import('./logger-server');
            await logToDb(level, message, meta);
        } catch (e) {
            // Fail silently - don't crash app if logging fails
            console.error('Failed to persist log to DB:', e);
        }
    }

    info(message: string, meta?: LogMeta) {
        this.log('info', message, meta);
    }

    warn(message: string, meta?: LogMeta) {
        this.log('warn', message, meta);
    }

    error(message: string, meta?: LogMeta) {
        this.log('error', message, meta);
    }
}

export const logger = new Logger();
