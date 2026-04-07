/**
 * Structured Logger Utility
 *
 * Level-gated logger that suppresses debug/info in production.
 * Use `createLogger('module-name')` to get a tagged logger instance.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel =
  process.env.NODE_ENV === 'production' ? 'warn' : 'debug';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

export const logger = {
  debug: (tag: string, ...args: unknown[]) => {
    if (shouldLog('debug')) console.log(`[${tag}]`, ...args);
  },
  info: (tag: string, ...args: unknown[]) => {
    if (shouldLog('info')) console.log(`[${tag}]`, ...args);
  },
  warn: (tag: string, ...args: unknown[]) => {
    if (shouldLog('warn')) console.warn(`[${tag}]`, ...args);
  },
  error: (tag: string, ...args: unknown[]) => {
    if (shouldLog('error')) console.error(`[${tag}]`, ...args);
  },
};

export function createLogger(tag: string) {
  return {
    debug: (...args: unknown[]) => logger.debug(tag, ...args),
    info: (...args: unknown[]) => logger.info(tag, ...args),
    warn: (...args: unknown[]) => logger.warn(tag, ...args),
    error: (...args: unknown[]) => logger.error(tag, ...args),
  };
}

export type Logger = ReturnType<typeof createLogger>;
