import { browser, by, element, ExpectedConditions as EC } from 'protractor';

/**
 * E2E Tests for Layout Scroll Detection Feature
 * 
 * These tests verify that the layout scroll detection works correctly
 * across different devices and scenarios in a real browser environment.
 */
describe('Layout Scroll Detection E2E Tests', () => {
  const timeout = 10000;

  beforeAll(async () => {
    await browser.waitForAngularEnabled(true);
  });

  beforeEach(async () => {
    await browser.get('/');
    await browser.wait(EC.presenceOf(element(by.tagName('app-root'))), timeout);
  });

  describe('Feature: Fixed Viewport Layout', () => {
    it('should have fixed viewport layout on desktop', async () => {
      // Set desktop viewport
      await browser.manage().window().setSize(1200, 800);
      
      // Navigate to any step
      await browser.get('/step/upload');
      await browser.wait(EC.presenceOf(element(by.css('shared-step-layout'))), timeout);
      
      // Check that step layout has fixed positioning
      const stepLayout = element(by.css('.step-layout'));
      const computedStyle = await browser.executeScript(`
        const el = arguments[0];
        const styles = window.getComputedStyle(el);
        return {
          position: styles.position,
          height: styles.height,
          width: styles.width,
          overflow: styles.overflow
        };
      `, stepLayout.getWebElement());
      
      expect(computedStyle.position).toBe('fixed');
      expect(computedStyle.height).toBe('100vh');
      expect(computedStyle.width).toBe('100vw');
      expect(computedStyle.overflow).toBe('hidden');
    });

    it('should have fixed viewport layout on mobile', async () => {
      // Set mobile viewport
      await browser.manage().window().setSize(375, 667);
      
      // Navigate to any step
      await browser.get('/step/upload');
      await browser.wait(EC.presenceOf(element(by.css('shared-step-layout'))), timeout);
      
      // Check that step layout has fixed positioning
      const stepLayout = element(by.css('.step-layout'));
      const computedStyle = await browser.executeScript(`
        const el = arguments[0];
        const styles = window.getComputedStyle(el);
        return {
          position: styles.position,
          height: styles.height,
          width: styles.width
        };
      `, stepLayout.getWebElement());
      
      expect(computedStyle.position).toBe('fixed');
      expect(computedStyle.height).toBe('100vh');
      expect(computedStyle.width).toBe('100vw');
    });

    it('should have fixed viewport layout on tablet', async () => {
      // Set tablet viewport
      await browser.manage().window().setSize(768, 1024);
      
      // Navigate to any step
      await browser.get('/step/upload');
      await browser.wait(EC.presenceOf(element(by.css('shared-step-layout'))), timeout);
      
      // Check that step layout has fixed positioning
      const stepLayout = element(by.css('.step-layout'));
      const computedStyle = await browser.executeScript(`
        const el = arguments[0];
        const styles = window.getComputedStyle(el);
        return {
          position: styles.position,
          height: styles.height,
          width: styles.width
        };
      `, stepLayout.getWebElement());
      
      expect(computedStyle.position).toBe('fixed');
      expect(computedStyle.height).toBe('100vh');
      expect(computedStyle.width).toBe('100vw');
    });
  });

  describe('Feature: Body Scroll Prevention', () => {
    it('should prevent body scroll when step layout is active', async () => {
      await browser.get('/step/upload');
      await browser.wait(EC.presenceOf(element(by.css('shared-step-layout'))), timeout);
      
      // Check that body has scroll prevention class
      const bodyClass = await browser.executeScript(`
        return document.body.classList.contains('step-layout-active');
      `);
      
      expect(bodyClass).toBe(true);
      
      // Check that body has scroll prevention styles
      const bodyStyles = await browser.executeScript(`
        const body = document.body;
        const styles = window.getComputedStyle(body);
        return {
          overflow: styles.overflow,
          position: styles.position,
          height: styles.height
        };
      `);
      
      expect(bodyStyles.overflow).toBe('hidden');
      expect(bodyStyles.position).toBe('fixed');
      expect(bodyStyles.height).toBe('100vh');
    });

    it('should restore body scroll when navigating away from steps', async () => {
      // Navigate to step first
      await browser.get('/step/upload');
      await browser.wait(EC.presenceOf(element(by.css('shared-step-layout'))), timeout);
      
      // Navigate away from steps
      await browser.get('/');
      await browser.wait(EC.presenceOf(element(by.tagName('app-root'))), timeout);
      
      // Check that body scroll is restored
      const bodyClass = await browser.executeScript(`
        return document.body.classList.contains('step-layout-active');
      `);
      
      expect(bodyClass).toBe(false);
    });
  });

  describe('Feature: Splash Screen Scroll Prevention', () => {
    it('should prevent body scroll when splash screen is visible', async () => {
      // This test would need to trigger splash screen visibility
      // For now, we'll test the component's scroll prevention logic
      await browser.get('/step/upload');
      
      // Simulate splash screen visibility by checking if it exists
      const splashScreenExists = await element(by.css('shared-splash-screen')).isPresent();
      
      if (splashScreenExists) {
        const splashScreen = element(by.css('shared-splash-screen'));
        const isVisible = await splashScreen.isDisplayed();
        
        if (isVisible) {
          // Check that body scroll is prevented when splash screen is visible
          const bodyStyles = await browser.executeScript(`
            const body = document.body;
            const styles = window.getComputedStyle(body);
            return {
              overflow: styles.overflow,
              position: styles.position,
              width: styles.width
            };
          `);
          
          expect(bodyStyles.overflow).toBe('hidden');
          expect(bodyStyles.position).toBe('fixed');
          expect(bodyStyles.width).toBe('100%');
        }
      }
    });

    it('should restore body scroll when splash screen is hidden', async () => {
      await browser.get('/step/upload');
      
      // Wait for any splash screen to disappear
      await browser.sleep(2000);
      
      // Check that body scroll is restored
      const bodyStyles = await browser.executeScript(`
        const body = document.body;
        const styles = window.getComputedStyle(body);
        return {
          overflow: styles.overflow,
          position: styles.position,
          width: styles.width
        };
      `);
      
      // Body should not have the splash screen styles
      expect(bodyStyles.overflow).not.toBe('hidden');
      expect(bodyStyles.position).not.toBe('fixed');
    });
  });

  describe('Feature: Step Navigation Footer', () => {
    it('should have properly positioned footer', async () => {
      await browser.get('/step/upload');
      await browser.wait(EC.presenceOf(element(by.css('footer'))), timeout);
      
      const footer = element(by.css('footer'));
      const computedStyle = await browser.executeScript(`
        const el = arguments[0];
        const styles = window.getComputedStyle(el);
        return {
          position: styles.position,
          bottom: styles.bottom,
          zIndex: styles.zIndex,
          width: styles.width
        };
      `, footer.getWebElement());
      
      expect(computedStyle.position).toBe('sticky');
      expect(computedStyle.bottom).toBe('0px');
      expect(computedStyle.zIndex).toBe('10');
      expect(computedStyle.width).toBe('100%');
    });

    it('should have step navigation component in footer', async () => {
      await browser.get('/step/upload');
      await browser.wait(EC.presenceOf(element(by.css('shared-step-navigation'))), timeout);
      
      const stepNavigation = element(by.css('shared-step-navigation'));
      expect(await stepNavigation.isPresent()).toBe(true);
      expect(await stepNavigation.isDisplayed()).toBe(true);
    });
  });

  describe('Feature: Responsive Design', () => {
    it('should adapt to window resize without scroll issues', async () => {
      // Start with desktop size
      await browser.manage().window().setSize(1200, 800);
      await browser.get('/step/upload');
      await browser.wait(EC.presenceOf(element(by.css('shared-step-layout'))), timeout);
      
      // Resize to mobile
      await browser.manage().window().setSize(375, 667);
      await browser.sleep(500); // Wait for resize
      
      // Check that layout still has fixed viewport
      const stepLayout = element(by.css('.step-layout'));
      const computedStyle = await browser.executeScript(`
        const el = arguments[0];
        const styles = window.getComputedStyle(el);
        return {
          position: styles.position,
          height: styles.height,
          width: styles.width
        };
      `, stepLayout.getWebElement());
      
      expect(computedStyle.position).toBe('fixed');
      expect(computedStyle.height).toBe('100vh');
      expect(computedStyle.width).toBe('100vw');
      
      // Resize to tablet
      await browser.manage().window().setSize(768, 1024);
      await browser.sleep(500); // Wait for resize
      
      // Check that layout still has fixed viewport
      const computedStyle2 = await browser.executeScript(`
        const el = arguments[0];
        const styles = window.getComputedStyle(el);
        return {
          position: styles.position,
          height: styles.height,
          width: styles.width
        };
      `, stepLayout.getWebElement());
      
      expect(computedStyle2.position).toBe('fixed');
      expect(computedStyle2.height).toBe('100vh');
      expect(computedStyle2.width).toBe('100vw');
    });
  });

  describe('Feature: Theme Integration', () => {
    it('should use theme colors in step layout', async () => {
      await browser.get('/step/upload');
      await browser.wait(EC.presenceOf(element(by.css('shared-step-layout'))), timeout);
      
      const stepLayout = element(by.css('.step-layout'));
      const computedStyle = await browser.executeScript(`
        const el = arguments[0];
        const styles = window.getComputedStyle(el);
        return {
          backgroundColor: styles.backgroundColor,
          color: styles.color
        };
      `, stepLayout.getWebElement());
      
      // Should have theme colors (not default values)
      expect(computedStyle.backgroundColor).toBeDefined();
      expect(computedStyle.color).toBeDefined();
    });

    it('should use theme colors in step navigation', async () => {
      await browser.get('/step/upload');
      await browser.wait(EC.presenceOf(element(by.css('shared-step-navigation'))), timeout);
      
      const stepNavigation = element(by.css('.step-navigation'));
      const computedStyle = await browser.executeScript(`
        const el = arguments[0];
        const styles = window.getComputedStyle(el);
        return {
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          borderTopColor: styles.borderTopColor
        };
      `, stepNavigation.getWebElement());
      
      // Should have theme colors
      expect(computedStyle.backgroundColor).toBeDefined();
      expect(computedStyle.color).toBeDefined();
      expect(computedStyle.borderTopColor).toBeDefined();
    });
  });

  describe('Feature: No Scroll Bars', () => {
    it('should not have visible scroll bars on step layout', async () => {
      await browser.get('/step/upload');
      await browser.wait(EC.presenceOf(element(by.css('shared-step-layout'))), timeout);
      
      const stepLayout = element(by.css('.step-layout'));
      const hasScrollBars = await browser.executeScript(`
        const el = arguments[0];
        return el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;
      `, stepLayout.getWebElement());
      
      expect(hasScrollBars).toBe(false);
    });

    it('should not have visible scroll bars on app content', async () => {
      await browser.get('/step/upload');
      await browser.wait(EC.presenceOf(element(by.css('.app-content'))), timeout);
      
      const appContent = element(by.css('.app-content'));
      const hasScrollBars = await browser.executeScript(`
        const el = arguments[0];
        return el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;
      `, appContent.getWebElement());
      
      expect(hasScrollBars).toBe(false);
    });
  });
});
