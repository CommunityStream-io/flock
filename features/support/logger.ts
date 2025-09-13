import pino from 'pino';

// Create logger instance with different levels for sharded tests
const logger = pino({
  level: process.env.SHARDED_TESTS === 'true' ? 'warn' : (process.env.LOG_LEVEL || 'info'),
  transport: process.env.NODE_ENV === 'development' && process.env.SHARDED_TESTS !== 'true' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  } : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    }
  }
});

// BDD-specific logger for test steps
export const bddLogger = {
  setup: (message: string) => logger.debug({ type: 'bdd-setup' }, `🔧 ${message}`),
  action: (message: string) => logger.debug({ type: 'bdd-action' }, `⚙️ ${message}`),
  success: (message: string) => logger.debug({ type: 'bdd-success' }, `✅ ${message}`),
  warning: (message: string) => logger.warn({ type: 'bdd-warning' }, `⚠️ ${message}`),
  error: (message: string) => logger.error({ type: 'bdd-error' }, `❌ ${message}`)
};

// Only log BDD messages when DEBUG_TESTS is true
export const bddLog = (message: string, type: 'setup' | 'action' | 'success' | 'warning' | 'error' = 'setup') => {
  if (process.env.DEBUG_TESTS === 'true') {
    bddLogger[type](message);
  }
};

export default logger;
