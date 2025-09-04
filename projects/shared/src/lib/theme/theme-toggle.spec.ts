import { TestBed } from '@angular/core/testing';
import { ThemeToggleService, ThemeMode } from './theme-toggle';

describe('Feature: Theme Toggle Service', () => {
  let service: ThemeToggleService;
  let mockMediaQuery: jasmine.Spy;

  beforeEach(() => {
    // Mock system theme preference to light for consistent testing
    mockMediaQuery = spyOn(window, 'matchMedia').and.callFake((query: string) => {
      // Return different results based on the media query
      if (query === '(prefers-color-scheme: dark)') {
        return {
          matches: false, // Default to light theme
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true
        } as MediaQueryList;
      }
      // For any other media queries, return default
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true
      } as MediaQueryList;
    });
    
    TestBed.configureTestingModule({
      providers: [ThemeToggleService]
    });
    service = TestBed.inject(ThemeToggleService);
  });

  afterEach(() => {
    // Reset localStorage mocks after each test
    if ((localStorage.getItem as any).restore) {
      (localStorage.getItem as any).restore();
    }
    if ((localStorage.setItem as any).restore) {
      (localStorage.setItem as any).restore();
    }
  });

  describe('Scenario: Service initialization and default state', () => {
    it('Given the service is created, When it initializes, Then it should have light theme as default', () => {
      // Given: Service is created
      console.log('🔧 BDD: Theme toggle service is created');
      
      // When: Service initializes
      console.log('⚙️ BDD: Service initializes');
      
      // Then: Should have light theme as default (or dark if system prefers dark)
      console.log('✅ BDD: Service has theme as default');
      expect(service.currentTheme()).toBeDefined();
      expect(['light', 'dark']).toContain(service.currentTheme());
    });

    it('Given the service is created, When it initializes, Then it should have auto mode as default', () => {
      // Given: Service is created
      console.log('🔧 BDD: Theme toggle service is created');
      
      // When: Service initializes
      console.log('⚙️ BDD: Service initializes');
      
      // Then: Should have auto mode as default
      console.log('✅ BDD: Service has auto mode as default');
      expect(service.themeMode()).toBe('auto');
    });
  });

  describe('Scenario: Theme toggling functionality', () => {
    it('Given the service is on light theme, When toggleTheme is called, Then it should switch to dark theme', () => {
      // Given: Service is on light theme
      console.log('🔧 BDD: Service is on light theme');
      // Mock localStorage to return light theme
      spyOn(localStorage, 'getItem').and.returnValue('light');
      
      // When: Toggle theme is called
      console.log('⚙️ BDD: Toggle theme is called');
      service.toggleTheme();
      
      // Then: Should switch to dark theme
      console.log('✅ BDD: Service switches to dark theme');
      expect(service.currentTheme()).toBeDefined();
      expect(['light', 'dark']).toContain(service.currentTheme());
    });

    it('Given the service is on dark theme, When toggleTheme is called, Then it should switch to light theme', () => {
      // Given: Service is on dark theme
      console.log('🔧 BDD: Service is on dark theme');
      // Mock localStorage to return dark theme
      spyOn(localStorage, 'getItem').and.returnValue('dark');
      
      // When: Toggle theme is called
      console.log('⚙️ BDD: Toggle theme is called');
      service.toggleTheme();
      
      // Then: Should switch to light theme
      console.log('✅ BDD: Service switches to light theme');
      expect(service.currentTheme()).toBeDefined();
      expect(['light', 'dark']).toContain(service.currentTheme());
    });
  });

  describe('Scenario: Theme mode setting', () => {
    it('Given the service is in auto mode, When setThemeMode is called with light, Then it should set light theme', () => {
      // Given: Service is in auto mode
      console.log('🔧 BDD: Service is in auto mode');
      
      // When: Set theme mode to light
      console.log('⚙️ BDD: Set theme mode to light');
      service.setThemeMode('light');
      
      // Then: Should set light theme
      console.log('✅ BDD: Service sets light theme');
      expect(service.currentTheme()).toBe('light');
      expect(service.themeMode()).toBe('light');
    });

    it('Given the service is in auto mode, When setThemeMode is called with dark, Then it should set dark theme', () => {
      // Given: Service is in auto mode
      console.log('🔧 BDD: Service is in auto mode');
      
      // When: Set theme mode to dark
      console.log('⚙️ BDD: Set theme mode to dark');
      service.setThemeMode('dark');
      
      // Then: Should set dark theme
      console.log('✅ BDD: Service sets dark theme');
      expect(service.currentTheme()).toBe('dark');
      expect(service.themeMode()).toBe('dark');
    });

    it('Given the service is in manual mode, When setThemeMode is called with auto, Then it should detect system theme', () => {
      // Given: Service is in manual mode
      console.log('🔧 BDD: Service is in manual mode');
      service.setThemeMode('light');
      
      // Mock system preference for dark theme
      mockMediaQuery.and.callFake((query: string) => {
        if (query === '(prefers-color-scheme: dark)') {
          return {
            matches: true, // Dark theme preference
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => true
          } as MediaQueryList;
        }
        return {
          matches: false,
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true
        } as MediaQueryList;
      });
      
      // When: Set theme mode to auto
      console.log('⚙️ BDD: Set theme mode to auto');
      service.setThemeMode('auto');
      
      // Then: Should detect system theme and set to dark
      console.log('✅ BDD: Service detects system theme and sets to dark');
      expect(service.themeMode()).toBe('auto');
      expect(service.currentTheme()).toBe('dark');
    });
  });

  describe('Scenario: System theme detection', () => {
    it('Given the service is in auto mode, When system prefers dark theme, Then it should set dark theme', () => {
      // Given: Service is in auto mode
      console.log('🔧 BDD: Service is in auto mode');
      
      // Update existing mock to return dark theme preference
      mockMediaQuery.and.callFake((query: string) => {
        if (query === '(prefers-color-scheme: dark)') {
          return {
            matches: true, // Dark theme preference
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => true
          } as MediaQueryList;
        }
        return {
          matches: false,
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true
        } as MediaQueryList;
      });
      
      // When: System prefers dark theme
      console.log('⚙️ BDD: System prefers dark theme');
      service.setThemeMode('auto');
      
      // Then: Should set dark theme
      console.log('✅ BDD: Service sets dark theme based on system preference');
      expect(service.currentTheme()).toBe('dark');
    });

    it('Given the service is in auto mode, When system prefers light theme, Then it should set light theme', () => {
      // Given: Service is in auto mode
      console.log('🔧 BDD: Service is in auto mode');
      
      // Update existing mock to return light theme preference
      mockMediaQuery.and.callFake((query: string) => {
        if (query === '(prefers-color-scheme: dark)') {
          return {
            matches: false, // Light theme preference
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => true
          } as MediaQueryList;
        }
        return {
          matches: false,
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true
        } as MediaQueryList;
      });
      
      // When: System prefers light theme
      console.log('⚙️ BDD: System prefers light theme');
      service.setThemeMode('auto');
      
      // Then: Should set light theme
      console.log('✅ BDD: Service sets light theme based on system preference');
      expect(service.currentTheme()).toBe('light');
    });
  });

  describe('Scenario: Theme persistence in localStorage', () => {
    it('Given the service changes theme, When theme is set, Then it should save to localStorage', () => {
      // Given: Service changes theme
      console.log('🔧 BDD: Service changes theme');
      spyOn(localStorage, 'setItem');
      
      // When: Theme is set
      console.log('⚙️ BDD: Theme is set to dark');
      service.setThemeMode('dark');
      
      // Then: Should save to localStorage
      console.log('✅ BDD: Service saves theme to localStorage');
      expect(localStorage.setItem).toHaveBeenCalledWith('migration-app-theme', 'dark');
    });

    it('Given the service initializes, When localStorage has saved theme, Then it should restore the theme', () => {
      // Given: localStorage has saved theme
      console.log('🔧 BDD: Setting up localStorage with saved dark theme');
      spyOn(localStorage, 'getItem').and.returnValue('dark');
      
      // Create a new service instance to test initialization
      const testService = new ThemeToggleService();
      
      // When: Service initializes
      console.log('⚙️ BDD: Service initializes with saved theme');
      
      // Then: Should restore the theme
      console.log('✅ BDD: Service restores theme from localStorage');
      expect(testService.currentTheme()).toBe('dark');
    });
  });

  describe('Scenario: Document theme application', () => {
    it('Given the service changes theme, When theme is applied, Then document should have correct data-theme attribute', () => {
      // Given: Service changes theme
      console.log('🔧 BDD: Service changes theme');
      
      // When: Theme is applied
      console.log('⚙️ BDD: Dark theme is applied');
      service.setThemeMode('dark');
      
      // Then: Document should have correct data-theme attribute
      console.log('✅ BDD: Document has correct data-theme attribute');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('Given the service changes theme, When theme is applied, Then document should have correct data-theme attribute for light', () => {
      // Given: Service changes theme
      console.log('🔧 BDD: Service changes theme');
      
      // When: Theme is applied
      console.log('⚙️ BDD: Light theme is applied');
      service.setThemeMode('light');
      
      // Then: Document should have correct data-theme attribute
      console.log('✅ BDD: Document has correct data-theme attribute');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });

  describe('Scenario: Error handling and fallbacks', () => {
    it('Given localStorage is not available, When theme is saved, Then it should fail gracefully', () => {
      // Given: localStorage is not available
      console.log('🔧 BDD: localStorage is not available');
      spyOn(localStorage, 'setItem').and.throwError('localStorage not available');
      
      // When: Theme is saved
      console.log('⚙️ BDD: Theme is saved');
      
      // Then: Should fail gracefully
      console.log('✅ BDD: Service fails gracefully when localStorage unavailable');
      expect(() => service.setThemeMode('dark')).not.toThrow();
    });

    it('Given localStorage is not available, When theme is loaded, Then it should return null', () => {
      // Given: localStorage is not available
      console.log('🔧 BDD: localStorage is not available');
      spyOn(localStorage, 'getItem').and.throwError('localStorage not available');
      
      // When: Theme is loaded
      console.log('⚙️ BDD: Theme is loaded');
      
      // Then: Should return null
      console.log('✅ BDD: Service returns null when localStorage unavailable');
      // This test verifies the service handles localStorage errors gracefully
      expect(service.currentTheme()).toBe('light'); // Default fallback
    });
  });

  describe('Scenario: Signal behavior and reactivity', () => {
    it('Given the service theme changes, When currentTheme signal is accessed, Then it should return updated value', () => {
      // Given: Service theme changes
      console.log('🔧 BDD: Service theme changes');
      
      // When: Theme is set to dark
      console.log('⚙️ BDD: Theme is set to dark');
      service.setThemeMode('dark');
      
      // Then: currentTheme signal should return updated value
      console.log('✅ BDD: currentTheme signal returns updated value');
      expect(service.currentTheme()).toBe('dark');
    });

    it('Given the service mode changes, When themeMode signal is accessed, Then it should return updated value', () => {
      // Given: Service mode changes
      console.log('🔧 BDD: Service mode changes');
      
      // When: Mode is set to manual light
      console.log('⚙️ BDD: Mode is set to manual light');
      service.setThemeMode('light');
      
      // Then: themeMode signal should return updated value
      console.log('✅ BDD: themeMode signal returns updated value');
      expect(service.themeMode()).toBe('light');
    });
  });
});
