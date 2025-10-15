import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Subject, Observable } from 'rxjs';
import { LOGGER, Logger } from 'shared';
import { ElectronService } from '../electron/electron.service';
import { CLIOutputData, CLIOptions } from '../../types/electron';

/**
 * CLI execution service for Flock Native
 * Handles execution of CLI commands via Electron IPC
 */
@Injectable({
  providedIn: 'root'
})
export class CLIService {
  private electronService = inject(ElectronService);
  private logger = inject<Logger>(LOGGER);
  
  private outputSubject = new Subject<CLIOutputData>();
  private errorSubject = new Subject<CLIOutputData>();
  
  public output$: Observable<CLIOutputData> = this.outputSubject.asObservable();
  public error$: Observable<CLIOutputData> = this.errorSubject.asObservable();

  private activeProcesses = new Map<string, () => void>();

  /**
   * Logging helpers with service name prefix
   */
  private log(...args: any[]) {
    const message = args.join(' ');
    console.log('🦅 [CLIService]', ...args);
    this.logger.log(`[CLIService] ${message}`);
  }

  private error(...args: any[]) {
    const message = args.join(' ');
    console.error('🦅 [CLIService]', ...args);
    this.logger.error(`[CLIService] ${message}`);
  }

  constructor() {
    // Setup CLI output listeners if in Electron environment
    if (this.electronService.isElectron()) {
      this.setupListeners();
    }
  }

  /**
   * Setup IPC listeners for CLI output
   */
  private setupListeners(): void {
    const api = this.electronService.getAPI();

    // Listen for CLI output
    const unsubscribeOutput = api.onCLIOutput((data) => {
      console.log('🦅 CLI Output:', data);
      this.outputSubject.next(data);
    });

    // Listen for CLI errors
    const unsubscribeError = api.onCLIError((data) => {
      console.error('🦅 CLI Error:', data);
      this.errorSubject.next(data);
    });

    // Store unsubscribe functions (would need cleanup on service destroy)
    console.log('🦅 CLI listeners registered');
  }

  /**
   * Execute a Node.js script via Electron utilityProcess
   * @param options Execution options (cwd, env)
   * @returns Promise<string> The process ID
   */
  async execute(
    options: CLIOptions = {}
  ): Promise<string> {
    try {
      console.log('🦅 Executing Node.js script:', options);

      const api = this.electronService.getAPI();
      // The IPC handler uses utilityProcess.fork() which runs Node.js natively
      const result = await api.executeCLI(options);

      if (!result.success || !result.processId) {
        throw new Error(result.error || 'Failed to execute CLI command');
      }

      console.log('🦅 CLI process started:', result.processId, `(PID: ${result.pid})`);
      return result.processId;
    } catch (error) {
      console.error('🦅 Error executing CLI:', error);
      throw error;
    }
  }

  /**
   * Cancel a running CLI process
   * @param processId The process ID to cancel
   */
  async cancel(processId: string): Promise<boolean> {
    try {
      console.log('🦅 Canceling CLI process:', processId);

      const api = this.electronService.getAPI();
      const result = await api.cancelCLI(processId);

      if (result.success) {
        console.log('🦅 CLI process canceled successfully');
        this.activeProcesses.delete(processId);
        return true;
      } else {
        console.error('🦅 Failed to cancel CLI process:', result.error);
        return false;
      }
    } catch (error) {
      console.error('🦅 Error canceling CLI:', error);
      return false;
    }
  }

  /**
   * Execute Instagram to Bluesky migration CLI via Electron IPC
   * The @straiforos/instagramtobluesky package reads config from process.env
   * 
   * **Important**: The @ prefix is automatically stripped from the username
   * because the AT Protocol expects identifiers without @ prefix for authentication.
   * Users enter "@user.bsky.social" for UX, but we pass "user.bsky.social" to the CLI.
   * 
   * @param archivePath Path to extracted Instagram archive folder
   * @param options Migration options
   * @returns Promise<string> The process ID
   */
  async executeMigration(
    archivePath: string,
    options: {
      blueskyHandle: string;
      blueskyPassword: string;
      dateFrom?: string;
      dateTo?: string;
      simulate?: boolean;
      testMode?: 'none' | 'video' | 'mixed';
    }
  ): Promise<string> {
    this.log('Starting Instagram to Bluesky migration...');
    this.log('Archive folder:', archivePath);
    this.log('Date range:', options.dateFrom || 'none', 'to', options.dateTo || 'none');
    this.log('Simulate mode:', options.simulate ? 'ON' : 'OFF');
    this.log('Test mode:', options.testMode || 'none');

    // Only allow test modes in development builds when explicitly enabled
    const testModesAllowed = !environment.production && !!environment.enableTestModes;
    const requestedTestMode = options.testMode && options.testMode !== 'none' ? options.testMode : 'none';
    const effectiveTestMode: 'none' | 'video' | 'mixed' = testModesAllowed ? (requestedTestMode as any) : 'none';
    if (!testModesAllowed && requestedTestMode !== 'none') {
      this.log('Test modes disabled in this build; ignoring requested test mode');
    }

    // Strip @ prefix from username if present
    // AT Protocol expects identifier without @ prefix
    const username = options.blueskyHandle.startsWith('@') 
      ? options.blueskyHandle.substring(1) 
      : options.blueskyHandle;

    // Build environment variables for the CLI
    // The @straiforos/instagramtobluesky package uses AppConfig.fromEnv()
    const env: Record<string, string> = {
      BLUESKY_USERNAME: username,
      BLUESKY_PASSWORD: options.blueskyPassword,
      ARCHIVE_FOLDER: archivePath,
      SIMULATE: options.simulate ? '1' : '0',
    };

    // Add test mode - override archive folder with test data
    if (effectiveTestMode === 'video') {
      // Don't use TEST_VIDEO_MODE env var - it has hardcoded paths in the CLI
      // Instead, just point ARCHIVE_FOLDER to our local test data
      // The main process will resolve this to the correct absolute path
      env['ARCHIVE_FOLDER'] = 'projects/flock-native/transfer/test_video';
      this.log('Test video mode enabled - using local test data');
      this.log('Test data path: projects/flock-native/transfer/test_video');
      this.log('Note: Not using TEST_VIDEO_MODE env var (CLI has hardcoded paths)');
    } else if (effectiveTestMode === 'mixed') {
      env['ARCHIVE_FOLDER'] = 'projects/flock-native/transfer/test_mixed_media';
      this.log('Test mixed media mode enabled - using local test data');
      this.log('Test data path: projects/flock-native/transfer/test_mixed_media');
      this.log('Note: Using proper archive structure (not CLI test mode)');
    }

    // Add optional date filters
    if (options.dateFrom) {
      env['MIN_DATE'] = options.dateFrom;
    }
    if (options.dateTo) {
      env['MAX_DATE'] = options.dateTo;
    }

    this.log('Environment variables configured');
    this.log('Executing migration CLI via Electron utilityProcess...');
    
    // Use Electron IPC to execute in a utility process (isolated Node.js context)
    return this.execute({ env });
  }

  /**
   * Parse CLI output for progress information
   * @param output The CLI output string
   * @returns Parsed progress data or null
   */
  parseProgress(output: string): { percentage?: number; message?: string } | null {
    // TODO: Implement progress parsing based on CLI output format
    // This will depend on how @straiforos/instagramtobluesky outputs progress
    
    // Example pattern matching for progress indicators
    const percentageMatch = output.match(/(\d+)%/);
    if (percentageMatch) {
      return {
        percentage: parseInt(percentageMatch[1], 10),
        message: output.trim()
      };
    }

    // Return null if no progress information found
    return null;
  }
}

