const { app } = require('electron');
const path = require('path');
const { createRequire } = require('module');

/**
 * Logging Setup Module
 * Handles electron-log configuration and setup for the main process
 */
class LoggingSetup {
  constructor(sentryInstance = null) {
    this.log = null;
    this.sentry = sentryInstance;
  }

  /**
   * Initialize electron-log with enhanced macOS support
   */
  async initialize() {
    try {
      const appRoot = app.getAppPath();
      const appRequire = createRequire(path.join(appRoot, '/'));

      // Prefer explicit main entry; fallback to package root
      try {
        const resolvedMain = appRequire.resolve('electron-log/main');
        console.log('🔍 [LOG] Resolved electron-log (main) at:', resolvedMain);
        this.log = appRequire('electron-log/main');
      } catch (_) {
        const resolvedRoot = appRequire.resolve('electron-log');
        console.log('🔍 [LOG] Resolved electron-log at:', resolvedRoot);
        this.log = appRequire('electron-log');
      }

      if (this.log && typeof this.log.initialize === 'function') {
        this.log.initialize();
      }

      const level = process.env.ELECTRON_LOG_LEVEL || 'silly';

      // Configure file transport
      this.configureFileTransport(level);

      // Configure console transport
      this.configureConsoleTransport(level);

      // Configure error catching
      this.configureErrorCatching();

      // Mirror console methods to electron-log
      this.mirrorConsoleMethods();

      // Log initialization success
      this.logInitializationSuccess();

      return true;
    } catch (e) {
      console.error('❌ [LOG] Failed to load electron-log (non-fatal):', e && e.message ? e.message : e);
      return false;
    }
  }

  /**
   * Configure file transport with enhanced macOS support
   */
  configureFileTransport(level) {
    if (this.log && this.log.transports && this.log.transports.file) {
      try {
        const logsDir = path.join(app.getPath('userData'), 'logs');
        const fs = require('fs');

        // Ensure logs directory exists with proper permissions on macOS
        if (!fs.existsSync(logsDir)) {
          fs.mkdirSync(logsDir, { recursive: true, mode: 0o755 });
        }

        // Set custom resolve path function for better macOS compatibility
        this.log.transports.file.resolvePath = () => {
          const logFile = path.join(logsDir, 'main.log');
          // Avoid logging here to prevent infinite recursion
          return logFile;
        };

        // Enhanced file transport configuration for macOS
        this.log.transports.file.level = level;
        this.log.transports.file.maxSize = 10 * 1024 * 1024; // 10MB max file size
        this.log.transports.file.archiveLog = (oldLogFile) => {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const archiveFile = path.join(logsDir, `main-${timestamp}.log`);
          try {
            fs.renameSync(oldLogFile, archiveFile);
            // Avoid logging here to prevent infinite recursion
          } catch (err) {
            // Use original console methods to avoid recursion
            if (console._originalWarn) {
              console._originalWarn('⚠️ [LOG] Failed to archive log file:', err.message);
            }
          }
        };

        // Ensure file permissions are correct on macOS
        try {
          const logFile = this.log.transports.file.resolvePath();
          if (fs.existsSync(logFile)) {
            fs.chmodSync(logFile, 0o644);
          }
        } catch (_) {}

      } catch (err) {
        console.error('❌ [LOG] Failed to configure file transport:', err.message);
      }
    }
  }

  /**
   * Configure console transport
   */
  configureConsoleTransport(level) {
    if (this.log && this.log.transports && this.log.transports.console) {
      this.log.transports.console.level = level;
      // Enhanced console formatting for macOS terminal
      this.log.transports.console.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';
    }
  }

  /**
   * Configure error catching with Sentry integration
   */
  configureErrorCatching() {
    if (this.log && typeof this.log.catchErrors === 'function') {
      this.log.catchErrors({
        showDialog: false,
        onError: (error, versions, submitIssue) => {
          console.error('❌ [LOG] Uncaught error captured:', error);
          // Send to Sentry if available
          if (this.sentry && typeof this.sentry.captureException === 'function') {
            this.sentry.captureException(error, {
              level: 'fatal',
              tags: {
                process: 'main',
                type: 'uncaughtException',
                platform: process.platform
              }
            });
          }
        }
      });
    }
  }

  /**
   * Mirror console methods to electron-log with enhanced error handling
   */
  mirrorConsoleMethods() {
    // Store original console methods globally to avoid circular references
    if (!console._originalLog) {
      console._originalLog = console.log;
      console._originalWarn = console.warn;
      console._originalError = console.error;
    }

    const originalLog = console._originalLog;
    const originalWarn = console._originalWarn;
    const originalError = console._originalError;

    // Only mirror if we haven't already done so
    if (!console._electronLogMirrored) {
      console.log = (...a) => {
        try {
          if (this.log && this.log.log) this.log.log(...a);
        } catch (err) {
          // Use original console.warn to avoid infinite recursion
          originalWarn('⚠️ [LOG] Failed to log to electron-log:', err.message);
        }
        originalLog(...a);
      };

      console.warn = (...a) => {
        try {
          if (this.log && this.log.warn) this.log.warn(...a);
        } catch (err) {
          originalWarn('⚠️ [LOG] Failed to warn to electron-log:', err.message);
        }
        originalWarn(...a);
      };

      console.error = (...a) => {
        try {
          if (this.log && this.log.error) this.log.error(...a);
        } catch (err) {
          originalWarn('⚠️ [LOG] Failed to error to electron-log:', err.message);
        }
        originalError(...a);
      };

      // Mark as mirrored to prevent double-mirroring
      console._electronLogMirrored = true;
    }
  }

  /**
   * Log initialization success with file path
   */
  logInitializationSuccess() {
    try {
      const filePath = this.log && this.log.transports && this.log.transports.file && this.log.transports.file.resolvePath ?
        this.log.transports.file.resolvePath() : 'unknown';
      console.log('🔍 [LOG] electron-log initialized successfully');
      console.log('📁 [LOG] Log file location:', filePath);
      console.log('📊 [LOG] Log level:', process.env.ELECTRON_LOG_LEVEL || 'silly');
      console.log('🖥️ [LOG] Platform:', process.platform);
    } catch (err) {
      console.log('🔍 [LOG] electron-log initialized (file path unavailable)');
      console.warn('⚠️ [LOG] Could not determine log file path:', err.message);
    }
  }

  /**
   * Get the log instance
   */
  getLog() {
    return this.log;
  }

  /**
   * Log a message
   */
  log(message, ...args) {
    if (this.log && this.log.log) {
      this.log.log(message, ...args);
    }
  }

  /**
   * Log a warning
   */
  warn(message, ...args) {
    if (this.log && this.log.warn) {
      this.log.warn(message, ...args);
    }
  }

  /**
   * Log an error
   */
  error(message, ...args) {
    if (this.log && this.log.error) {
      this.log.error(message, ...args);
    }
  }
}

module.exports = LoggingSetup;
