export interface Logger {
  /**
   * Logs general information.
   * @param message The message to log.
   */
  log(message: string, object?: any): void;
  /**
   * Logs error messages.
   * @param message The error message to log.
   */
  error(message: string, object?: any): void;
  /**
   * Logs warning messages.
   * @param message The warning message to log.
   */
  warn(message: string, object?: any): void;
  /**
   * Logs workflow-related information.
   * @param message The workflow message to log.
   */
  workflow(message: string, object?: any): void;
  /**
   * Configures instrumentation for specific application
   * @param message
   */
  instrument(appName: string): Promise<void>;
}
