import { PlatformAdapter } from './PlatformAdapter.interface';

/**
 * Web Platform Adapter
 * 
 * Implements platform-specific behavior for Web (Mirage) platform.
 * - Uses HTML file inputs
 * - Uses standard browser navigation
 * - Simulates authentication (demo mode)
 */
export class WebAdapter implements PlatformAdapter {
  platform = 'web' as const;
  
  /**
   * Select file using HTML file input
   */
  async selectFile(path: string): Promise<void> {
    const input = await $('input[type="file"]');
    await input.waitForDisplayed({ timeout: 5000 });
    await input.setValue(path);
    
    console.log('[WebAdapter] Selected file:', path);
  }
  
  /**
   * Select multiple files using HTML file input
   */
  async selectFiles(paths: string[]): Promise<void> {
    const input = await $('input[type="file"]');
    await input.waitForDisplayed({ timeout: 5000 });
    
    // Set multiple files - works with remote file paths
    // Note: Some WebDriver implementations may not support multiple files
    for (const path of paths) {
      await input.setValue(path);
    }
    
    console.log('[WebAdapter] Selected files:', paths);
  }
  
  /**
   * Navigate using standard browser URL
   */
  async navigateTo(route: string): Promise<void> {
    const baseUrl = process.env.BASE_URL || 'http://localhost:4200';
    const url = `${baseUrl}${route}`;
    
    await browser.url(url);
    console.log('[WebAdapter] Navigated to:', url);
  }
  
  /**
   * Authenticate in demo mode (mock authentication)
   * Web demo mode doesn't actually authenticate with Bluesky
   */
  async authenticate(username: string, password: string): Promise<void> {
    console.log('[WebAdapter] Demo authentication:', username);
    
    // In web demo mode, just fill the form
    const usernameInput = await $('#username');
    const passwordInput = await $('#password');
    const submitButton = await $('button[type="submit"]');
    
    await usernameInput.waitForDisplayed({ timeout: 5000 });
    await usernameInput.setValue(username);
    await passwordInput.setValue(password);
    await submitButton.click();
    
    console.log('[WebAdapter] Demo authentication submitted');
  }
  
  /**
   * Get browser context
   */
  async getContext(): Promise<any> {
    return {
      url: await browser.getUrl(),
      title: await browser.getTitle(),
      platform: this.platform
    };
  }
}



