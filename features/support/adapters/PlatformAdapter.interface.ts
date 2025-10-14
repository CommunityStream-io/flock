/**
 * Platform Adapter Interface
 * 
 * Defines a common interface for platform-specific implementations.
 * This allows tests to be written once and run on multiple platforms
 * (Web, Electron, Mobile) with platform-specific behavior handled
 * by concrete adapter implementations.
 */

export interface PlatformAdapter {
  /** The platform type this adapter handles */
  platform: 'web' | 'electron' | 'mobile';
  
  /** Operating system (for Electron/Mobile platforms) */
  os?: 'windows' | 'macos' | 'linux';
  
  /**
   * Select a single file
   * - Web: Uses HTML file input
   * - Electron: Uses native OS dialog
   * - Mobile: Uses native picker
   */
  selectFile(path: string): Promise<void>;
  
  /**
   * Select multiple files
   * - Web: Uses HTML file input with multiple attribute
   * - Electron: Uses native OS dialog with multi-select
   * - Mobile: Uses native picker with multi-select
   */
  selectFiles(paths: string[]): Promise<void>;
  
  /**
   * Navigate to a route in the application
   * - Web: Uses http://localhost:4200/route
   * - Electron: Uses app:///route protocol
   * - Mobile: Uses native navigation
   */
  navigateTo(route: string): Promise<void>;
  
  /**
   * Authenticate with Bluesky
   * - Web: Mock authentication in demo mode
   * - Electron: Real authentication via IPC
   * - Mobile: Real authentication via native API
   */
  authenticate(username: string, password: string): Promise<void>;
  
  /**
   * Execute a native action (platform-specific)
   * - Electron: IPC commands, CLI execution, window management
   * - Mobile: Native gestures, app lifecycle
   * - Web: Not available
   */
  executeNativeAction?(action: string, params?: any): Promise<any>;
  
  /**
   * Send IPC message to main process (Electron only)
   * Used for testing Electron-specific features like CLI execution
   */
  sendIpcMessage?(channel: string, data: any): Promise<any>;
  
  /**
   * Get the current window/browser context
   */
  getContext?(): Promise<any>;
}



