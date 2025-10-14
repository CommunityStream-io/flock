import { PlatformAdapter } from './PlatformAdapter.interface';

/**
 * Electron Platform Adapter
 * 
 * Implements platform-specific behavior for Electron (Native) platform.
 * - Uses native OS file dialogs
 * - Uses app:// protocol navigation
 * - Real Bluesky authentication via IPC
 * - Supports IPC communication for CLI testing
 */
export class ElectronAdapter implements PlatformAdapter {
  platform = 'electron' as const;
  os: 'windows' | 'macos' | 'linux';
  
  constructor() {
    this.os = this.detectOS();
    console.log('[ElectronAdapter] Initialized for OS:', this.os);
  }
  
  /**
   * Select file using native OS dialog
   * In test environment, we bypass the dialog and directly set the file
   */
  async selectFile(path: string): Promise<void> {
    console.log('[ElectronAdapter] Selecting file via native dialog:', path);
    
    // For testing, we can send the file path directly via IPC
    // In real usage, this would trigger the native dialog
    await this.sendIpcMessage('dialog:setSelectedFile', { path });
    
    console.log('[ElectronAdapter] File selected:', path);
  }
  
  /**
   * Select multiple files using native OS dialog
   */
  async selectFiles(paths: string[]): Promise<void> {
    console.log('[ElectronAdapter] Selecting files via native dialog:', paths);
    
    await this.sendIpcMessage('dialog:setSelectedFiles', { paths });
    
    console.log('[ElectronAdapter] Files selected:', paths);
  }
  
  /**
   * Navigate using app:// protocol
   */
  async navigateTo(route: string): Promise<void> {
    // Electron apps use app:// protocol
    // Remove leading slash if present
    const cleanRoute = route.startsWith('/') ? route.substring(1) : route;
    const url = `app:///${cleanRoute}`;
    
    await browser.url(url);
    console.log('[ElectronAdapter] Navigated to:', url);
  }
  
  /**
   * Authenticate with real Bluesky API via IPC
   */
  async authenticate(username: string, password: string): Promise<void> {
    console.log('[ElectronAdapter] Real authentication via IPC:', username);
    
    const result = await this.sendIpcMessage('auth:login', {
      username,
      password
    });
    
    if (!result.success) {
      throw new Error(`Authentication failed: ${result.error}`);
    }
    
    console.log('[ElectronAdapter] Authentication successful');
  }
  
  /**
   * Execute a native action (Electron-specific)
   */
  async executeNativeAction(action: string, params?: any): Promise<any> {
    console.log('[ElectronAdapter] Executing native action:', action, params);
    
    switch (action) {
      case 'cli:execute':
        return await this.sendIpcMessage('execute-cli', params);
      
      case 'window:resize':
        return await browser.setWindowSize(params.width, params.height);
      
      case 'window:getSize':
        return await browser.getWindowSize();
      
      case 'window:maximize':
        return await browser.maximizeWindow();
      
      case 'app:restart':
        // This would require special handling
        throw new Error('App restart not implemented in test environment');
      
      default:
        throw new Error(`Unknown native action: ${action}`);
    }
  }
  
  /**
   * Send IPC message to Electron main process
   */
  async sendIpcMessage(channel: string, data: any = {}): Promise<any> {
    console.log('[ElectronAdapter] Sending IPC message:', channel, data);
    
    // Use browser.electron.execute to invoke IPC in the Electron context
    // This requires wdio-electron-service
    const result = await browser.electron.execute((electron, args) => {
      return electron.ipcRenderer.invoke(args.channel, args.data);
    }, { channel, data });
    
    console.log('[ElectronAdapter] IPC response:', result);
    return result;
  }
  
  /**
   * Get Electron application context
   */
  async getContext(): Promise<any> {
    const windowSize = await browser.getWindowSize();
    
    return {
      platform: this.platform,
      os: this.os,
      windowSize,
      appVersion: await this.getAppVersion()
    };
  }
  
  /**
   * Get Electron app version
   */
  private async getAppVersion(): Promise<string> {
    try {
      const result = await browser.electron.execute((electron) => {
        return electron.app.getVersion();
      });
      return result;
    } catch (error) {
      console.warn('[ElectronAdapter] Could not get app version:', error);
      return 'unknown';
    }
  }
  
  /**
   * Detect the operating system
   */
  private detectOS(): 'windows' | 'macos' | 'linux' {
    const platform = process.platform;
    
    if (platform === 'win32') return 'windows';
    if (platform === 'darwin') return 'macos';
    return 'linux';
  }
}



