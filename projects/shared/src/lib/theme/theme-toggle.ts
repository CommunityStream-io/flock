import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class ThemeToggleService {
  private readonly _currentTheme = signal<'light' | 'dark'>('light');
  private readonly _themeMode = signal<ThemeMode>('auto');
  
  readonly currentTheme = this._currentTheme.asReadonly();
  readonly themeMode = this._themeMode.asReadonly();

  constructor() {
    this.initializeTheme();
  }

  toggleTheme(): void {
    const newTheme = this._currentTheme() === 'light' ? 'dark' : 'light';
    this._currentTheme.set(newTheme);
    this.applyTheme(newTheme);
  }

  setThemeMode(mode: ThemeMode): void {
    this._themeMode.set(mode);
    
    if (mode === 'auto') {
      this.detectSystemTheme();
    } else {
      const theme = mode === 'dark' ? 'dark' : 'light';
      this._currentTheme.set(theme);
      this.applyTheme(theme);
    }
  }

  private initializeTheme(): void {
    // Check for saved theme preference
    const savedTheme = this.loadSavedTheme();
    if (savedTheme) {
      this._currentTheme.set(savedTheme);
      this.applyTheme(savedTheme);
    } else if (this._themeMode() === 'auto') {
      this.detectSystemTheme();
    }
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    const root = document.documentElement;
    
    // Simply set the data-theme attribute - CSS handles the rest!
    root.setAttribute('data-theme', theme);
    
    // Save theme preference
    this.saveTheme(theme);
  }

  private detectSystemTheme(): void {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = prefersDark ? 'dark' : 'light';
    this._currentTheme.set(theme);
    this.applyTheme(theme);
  }

  private loadSavedTheme(): 'light' | 'dark' | null {
    try {
      const saved = localStorage.getItem('migration-app-theme');
      return saved === 'dark' || saved === 'light' ? saved : null;
    } catch {
      return null;
    }
  }

  private saveTheme(theme: 'light' | 'dark'): void {
    try {
      localStorage.setItem('migration-app-theme', theme);
    } catch {
      // Silently fail if localStorage is not available
    }
  }
}
