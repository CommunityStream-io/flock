import { PlatformAdapter } from './PlatformAdapter.interface';
import { WebAdapter } from './WebAdapter';
import { ElectronAdapter } from './ElectronAdapter';

/**
 * Platform Factory
 * 
 * Factory pattern for creating the appropriate platform adapter
 * based on environment configuration.
 * 
 * Usage:
 * ```typescript
 * const adapter = PlatformFactory.createAdapter();
 * await adapter.selectFile('/path/to/file.zip');
 * ```
 * 
 * Environment Variables:
 * - PLATFORM: 'web' | 'electron' | 'mobile' (default: 'web')
 */
export class PlatformFactory {
  private static instance: PlatformAdapter | null = null;
  
  /**
   * Create or return cached adapter instance
   * Uses singleton pattern to avoid recreating adapters
   */
  static createAdapter(): PlatformAdapter {
    // Return cached instance if available
    if (this.instance) {
      return this.instance;
    }
    
    // Determine platform from environment
    const platform = process.env.PLATFORM || 'web';
    
    console.log('[PlatformFactory] Creating adapter for platform:', platform);
    
    switch (platform.toLowerCase()) {
      case 'web':
        this.instance = new WebAdapter();
        break;
      
      case 'electron':
        this.instance = new ElectronAdapter();
        break;
      
      case 'mobile':
        throw new Error('Mobile platform adapter not yet implemented');
      
      default:
        throw new Error(`Unknown platform: ${platform}. Use 'web', 'electron', or 'mobile'`);
    }
    
    console.log('[PlatformFactory] Adapter created:', this.instance.platform);
    return this.instance;
  }
  
  /**
   * Reset the factory (useful for testing)
   */
  static reset(): void {
    this.instance = null;
  }
  
  /**
   * Get the current platform name
   */
  static getCurrentPlatform(): string {
    return process.env.PLATFORM || 'web';
  }
  
  /**
   * Check if running on a specific platform
   */
  static isWeb(): boolean {
    return this.getCurrentPlatform() === 'web';
  }
  
  static isElectron(): boolean {
    return this.getCurrentPlatform() === 'electron';
  }
  
  static isMobile(): boolean {
    return this.getCurrentPlatform() === 'mobile';
  }
}



