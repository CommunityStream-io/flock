# Styling Architecture - Material Design 3 (M3) Theming

## 📚 **Navigation**
- **[← Back to Overview](ARCHITECTURE_OVERVIEW.md)**
- **[Component Architecture →](COMPONENT_ARCHITECTURE.md)**
- **[Service Architecture →](SERVICE_ARCHITECTURE.md)**

---

## 🎯 **Styling Architecture Overview**

This document defines the styling architecture for the Bluesky Migration Application, implementing Material Design 3 (M3) principles through a centralized shared library approach. The theme system provides consistent, accessible, and modern UI components across all application variants.

### **Key Principles**
1. **M3-First Design** - Follow Material Design 3 specifications and guidelines
2. **Shared Library** - Centralized theming in the shared library for consistency
3. **CSS Custom Properties** - Theme-based color system with CSS classes
4. **Simple Theme Toggle** - Light/dark themes via data-theme attribute
5. **Component Encapsulation** - Scoped styling with global theme inheritance
6. **Accessibility** - WCAG AA compliance with proper contrast ratios
7. **Responsive Design** - Mobile-first approach with breakpoint system

---

## 🎨 **Material Design 3 Foundation**

### **1. M3 Color System**

#### **Theme-Based Color System**
```scss
// src/lib/theme/m3-color-system.scss

// Light theme (default)
:root {
  // Primary Colors
  --md-sys-color-primary: #6750a4;
  --md-sys-color-on-primary: #ffffff;
  --md-sys-color-primary-container: #eaddff;
  --md-sys-color-on-primary-container: #21005d;
  
  // Secondary Colors
  --md-sys-color-secondary: #625b71;
  --md-sys-color-on-secondary: #ffffff;
  --md-sys-color-secondary-container: #e8def8;
  --md-sys-color-on-secondary-container: #1d192b;
  
  // Tertiary Colors
  --md-sys-color-tertiary: #7d5260;
  --md-sys-color-on-tertiary: #ffffff;
  --md-sys-color-tertiary-container: #ffd8e4;
  --md-sys-color-on-tertiary-container: #31111d;
  
  // Surface Colors
  --md-sys-color-surface: #fffbfe;
  --md-sys-color-on-surface: #1c1b1f;
  --md-sys-color-surface-variant: #e7e0ec;
  --md-sys-color-on-surface-variant: #49454f;
  
  // Background Colors
  --md-sys-color-background: #fffbfe;
  --md-sys-color-on-background: #1c1b1f;
  
  // Error Colors
  --md-sys-color-error: #ba1a1a;
  --md-sys-color-on-error: #ffffff;
  --md-sys-color-error-container: #ffdad6;
  --md-sys-color-on-error-container: #410002;
  
  // Outline Colors
  --md-sys-color-outline: #79747e;
  --md-sys-color-outline-variant: #cac4d0;
  
  // Shadow Colors
  --md-sys-color-shadow: #000000;
  --md-sys-color-scrim: #000000;
  
  // Inverse Colors
  --md-sys-color-inverse-surface: #313033;
  --md-sys-color-inverse-on-surface: #f4eff4;
  --md-sys-color-inverse-primary: #d0bcff;
}

// Dark theme
:root[data-theme="dark"] {
  // Primary Colors
  --md-sys-color-primary: #d0bcff;
  --md-sys-color-on-primary: #381e72;
  --md-sys-color-primary-container: #4f378b;
  --md-sys-color-on-primary-container: #eaddff;
  
  // Secondary Colors
  --md-sys-color-secondary: #ccc2dc;
  --md-sys-color-on-secondary: #332d41;
  --md-sys-color-secondary-container: #4a4458;
  --md-sys-color-on-secondary-container: #e8def8;
  
  // Tertiary Colors
  --md-sys-color-tertiary: #efb8c8;
  --md-sys-color-on-tertiary: #492532;
  --md-sys-color-tertiary-container: #633b48;
  --md-sys-color-on-tertiary-container: #ffd8e4;
  
  // Surface Colors
  --md-sys-color-surface: #1c1b1f;
  --md-sys-color-on-surface: #e6e1e5;
  --md-sys-color-surface-variant: #49454f;
  --md-sys-color-on-surface-variant: #cac4d0;
  
  // Background Colors
  --md-sys-color-background: #1c1b1f;
  --md-sys-color-on-background: #e6e1e5;
  
  // Error Colors
  --md-sys-color-error: #ffb4ab;
  --md-sys-color-on-error: #690005;
  --md-sys-color-error-container: #93000a;
  --md-sys-color-on-error-container: #ffdad6;
  
  // Outline Colors
  --md-sys-color-outline: #938f99;
  --md-sys-color-outline-variant: #49454f;
  
  // Shadow Colors
  --md-sys-color-shadow: #000000;
  --md-sys-color-scrim: #000000;
  
  // Inverse Colors
  --md-sys-color-inverse-surface: #e6e1e5;
  --md-sys-color-inverse-on-surface: #1c1b1f;
  --md-sys-color-inverse-primary: #6750a4;
}
```

#### **Color Token Mapping**
```scss
// Semantic color mapping for components
$m3-semantic-colors: (
  'primary': (
    'main': var(--md-sys-color-primary),
    'on': var(--md-sys-color-on-primary),
    'container': var(--md-sys-color-primary-container),
    'on-container': var(--md-sys-color-on-primary-container)
  ),
  'secondary': (
    'main': var(--md-sys-color-secondary),
    'on': var(--md-sys-color-on-secondary),
    'container': var(--md-sys-color-secondary-container),
    'on-container': var(--md-sys-color-on-secondary-container)
  ),
  'surface': (
    'main': var(--md-sys-color-surface),
    'on': var(--md-sys-color-on-surface),
    'variant': var(--md-sys-color-surface-variant),
    'on-variant': var(--md-sys-color-on-surface-variant)
  ),
  'error': (
    'main': var(--md-sys-color-error),
    'on': var(--md-sys-color-on-error),
    'container': var(--md-sys-color-error-container),
    'on-container': var(--md-sys-color-on-error-container)
  )
);
```

### **2. M3 Typography System**

#### **Type Scale**
```scss
// src/lib/theme/m3-typography.scss
:root {
  // Display Styles
  --md-sys-typescale-display-large-size: 57px;
  --md-sys-typescale-display-large-line-height: 64px;
  --md-sys-typescale-display-large-weight: 400;
  
  --md-sys-typescale-display-medium-size: 45px;
  --md-sys-typescale-display-medium-line-height: 52px;
  --md-sys-typescale-display-medium-weight: 400;
  
  --md-sys-typescale-display-small-size: 36px;
  --md-sys-typescale-display-small-line-height: 44px;
  --md-sys-typescale-display-small-weight: 400;
  
  // Headline Styles
  --md-sys-typescale-headline-large-size: 32px;
  --md-sys-typescale-headline-large-line-height: 40px;
  --md-sys-typescale-headline-large-weight: 400;
  
  --md-sys-typescale-headline-medium-size: 28px;
  --md-sys-typescale-headline-medium-line-height: 36px;
  --md-sys-typescale-headline-medium-weight: 400;
  
  --md-sys-typescale-headline-small-size: 24px;
  --md-sys-typescale-headline-small-line-height: 32px;
  --md-sys-typescale-headline-small-weight: 400;
  
  // Title Styles
  --md-sys-typescale-title-large-size: 22px;
  --md-sys-typescale-title-large-line-height: 28px;
  --md-sys-typescale-title-large-weight: 400;
  
  --md-sys-typescale-title-medium-size: 16px;
  --md-sys-typescale-title-medium-line-height: 24px;
  --md-sys-typescale-title-medium-weight: 500;
  
  --md-sys-typescale-title-small-size: 14px;
  --md-sys-typescale-title-small-line-height: 20px;
  --md-sys-typescale-title-small-weight: 500;
  
  // Body Styles
  --md-sys-typescale-body-large-size: 16px;
  --md-sys-typescale-body-large-line-height: 24px;
  --md-sys-typescale-body-large-weight: 400;
  
  --md-sys-typescale-body-medium-size: 14px;
  --md-sys-typescale-body-medium-line-height: 20px;
  --md-sys-typescale-body-medium-weight: 400;
  
  --md-sys-typescale-body-small-size: 12px;
  --md-sys-typescale-body-small-line-height: 16px;
  --md-sys-typescale-body-small-weight: 400;
  
  // Label Styles
  --md-sys-typescale-label-large-size: 14px;
  --md-sys-typescale-label-large-line-height: 20px;
  --md-sys-typescale-label-large-weight: 500;
  
  --md-sys-typescale-label-medium-size: 12px;
  --md-sys-typescale-label-medium-line-height: 16px;
  --md-sys-typescale-label-medium-weight: 500;
  
  --md-sys-typescale-label-small-size: 11px;
  --md-sys-typescale-label-small-line-height: 16px;
  --md-sys-typescale-label-small-weight: 500;
}
```

#### **Typography Mixins**
```scss
// Typography utility mixins
@mixin m3-display-large {
  font-size: var(--md-sys-typescale-display-large-size);
  line-height: var(--md-sys-typescale-display-large-line-height);
  font-weight: var(--md-sys-typescale-display-large-weight);
  letter-spacing: -0.25px;
}

@mixin m3-display-medium {
  font-size: var(--md-sys-typescale-display-medium-size);
  line-height: var(--md-sys-typescale-display-medium-line-height);
  font-weight: var(--md-sys-typescale-display-medium-weight);
  letter-spacing: 0px;
}

@mixin m3-headline-large {
  font-size: var(--md-sys-typescale-headline-large-size);
  line-height: var(--md-sys-typescale-headline-large-line-height);
  font-weight: var(--md-sys-typescale-headline-large-weight);
  letter-spacing: 0px;
}

@mixin m3-title-large {
  font-size: var(--md-sys-typescale-title-large-size);
  line-height: var(--md-sys-typescale-title-large-line-height);
  font-weight: var(--md-sys-typescale-title-large-weight);
  letter-spacing: 0px;
}

@mixin m3-body-large {
  font-size: var(--md-sys-typescale-body-large-size);
  line-height: var(--md-sys-typescale-body-large-line-height);
  font-weight: var(--md-sys-typescale-body-large-weight);
  letter-spacing: 0.5px;
}

@mixin m3-label-large {
  font-size: var(--md-sys-typescale-label-large-size);
  line-height: var(--md-sys-typescale-label-large-line-height);
  font-weight: var(--md-sys-typescale-label-large-weight);
  letter-spacing: 0.1px;
}
```

### **3. M3 Elevation & Shadows**

#### **Elevation System**
```scss
// src/lib/theme/m3-elevation.scss
:root {
  // Elevation levels (0-5)
  --md-sys-elevation-level0: 0px;
  --md-sys-elevation-level1: 1px;
  --md-sys-elevation-level2: 3px;
  --md-sys-elevation-level3: 6px;
  --md-sys-elevation-level4: 8px;
  --md-sys-elevation-level5: 12px;
  
  // Shadow colors
  --md-sys-elevation-shadow-color: var(--md-sys-color-shadow);
  --md-sys-elevation-shadow-opacity: 0.12;
}

// Elevation mixins
@mixin m3-elevation($level: 1) {
  $elevation: var(--md-sys-elevation-level#{$level});
  $shadow-color: var(--md-sys-elevation-shadow-color);
  $shadow-opacity: var(--md-sys-elevation-shadow-opacity);
  
  @if $level == 0 {
    box-shadow: none;
  } @else if $level == 1 {
    box-shadow: 
      0px 1px 2px rgba($shadow-color, $shadow-opacity),
      0px 1px 3px 1px rgba($shadow-color, $shadow-opacity * 0.14);
  } @else if $level == 2 {
    box-shadow: 
      0px 1px 2px rgba($shadow-color, $shadow-opacity),
      0px 2px 6px 2px rgba($shadow-color, $shadow-opacity * 0.15);
  } @else if $level == 3 {
    box-shadow: 
      0px 4px 8px 3px rgba($shadow-color, $shadow-opacity * 0.15),
      0px 1px 3px rgba($shadow-color, $shadow-opacity);
  } @else if $level == 4 {
    box-shadow: 
      0px 6px 10px 4px rgba($shadow-color, $shadow-opacity * 0.15),
      0px 2px 4px rgba($shadow-color, $shadow-opacity);
  } @else if $level == 5 {
    box-shadow: 
      0px 8px 12px 6px rgba($shadow-color, $shadow-opacity * 0.15),
      0px 4px 6px rgba($shadow-color, $shadow-opacity);
  }
}
```

---

## 🏗️ **Theme Architecture**

### **1. Theme Toggle Service**

#### **Simple Theme Management**
```typescript
// src/lib/theme/theme-toggle.service.ts
import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'auto';

@Injectable({ providedIn: 'root' })
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
```

### **2. Theme Toggle Component**

#### **Simple Theme Toggle UI**
```typescript
// src/lib/components/theme-toggle/theme-toggle.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeToggleService } from '../../theme/theme-toggle.service';

@Component({
  selector: 'm3-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      class="m3-theme-toggle" 
      (click)="toggleTheme()"
      [attr.aria-label]="'Switch to ' + (currentTheme() === 'light' ? 'dark' : 'light') + ' theme'"
    >
      <span class="m3-theme-toggle__icon" [class.m3-theme-toggle__icon--dark]="currentTheme() === 'dark'">
        🌙
      </span>
      <span class="m3-theme-toggle__icon" [class.m3-theme-toggle__icon--light]="currentTheme() === 'light'">
        ☀️
      </span>
    </button>
  `,
  styles: [`
    .m3-theme-toggle {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      transition: background-color 0.2s ease;
      
      &:hover {
        background-color: var(--md-sys-color-primary-container);
      }
      
      &:focus-visible {
        outline: 2px solid var(--md-sys-color-primary);
        outline-offset: 2px;
      }
    }
    
    .m3-theme-toggle__icon {
      font-size: 20px;
      transition: opacity 0.2s ease;
      
      &--light {
        opacity: 1;
      }
      
      &--dark {
        opacity: 0.3;
      }
    }
  `]
})
export class ThemeToggleComponent {
  private themeService = inject(ThemeToggleService);
  
  readonly currentTheme = this.themeService.currentTheme;
  
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
```

---

## 🎭 **Component Styling Strategy**

### **1. Component Style Encapsulation**

#### **Base Component Styles**
```scss
// src/lib/theme/base-component.scss
@import 'm3-color-system';
@import 'm3-typography';
@import 'm3-elevation';

// Base component mixin
@mixin base-component {
  // Reset and base styles
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  
  // Typography
  font-family: 'Roboto', sans-serif;
  @include m3-body-large;
  color: var(--md-sys-color-on-surface);
  
  // Background
  background-color: var(--md-sys-color-surface);
  
  // Transitions
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

// Interactive element mixin
@mixin interactive-element {
  cursor: pointer;
  user-select: none;
  
  &:hover {
    @include m3-elevation(2);
  }
  
  &:active {
    @include m3-elevation(1);
  }
  
  &:focus-visible {
    outline: 2px solid var(--md-sys-color-primary);
    outline-offset: 2px;
  }
  
  &:disabled {
    opacity: 0.38;
    cursor: not-allowed;
    pointer-events: none;
  }
}
```

#### **Button Component Styles**
```scss
// src/lib/components/button/button.component.scss
@import '../../theme/base-component';

.m3-button {
  @include base-component;
  @include interactive-element;
  
  // Button specific styles
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 24px;
  border: none;
  border-radius: 20px;
  min-height: 40px;
  
  // Typography
  @include m3-label-large;
  font-weight: 500;
  
  // Variants
  &.m3-button--filled {
    background-color: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
    
    &:hover {
      background-color: var(--md-sys-color-primary-container);
      color: var(--md-sys-color-on-primary-container);
    }
  }
  
  &.m3-button--outlined {
    background-color: transparent;
    color: var(--md-sys-color-primary);
    border: 1px solid var(--md-sys-color-outline);
    
    &:hover {
      background-color: var(--md-sys-color-primary-container);
      color: var(--md-sys-color-on-primary-container);
      border-color: var(--md-sys-color-primary);
    }
  }
  
  &.m3-button--text {
    background-color: transparent;
    color: var(--md-sys-color-primary);
    padding: 10px 16px;
    
    &:hover {
      background-color: var(--md-sys-color-primary-container);
      color: var(--md-sys-color-on-primary-container);
    }
  }
  
  // Sizes
  &.m3-button--small {
    padding: 8px 16px;
    min-height: 32px;
    @include m3-label-medium;
  }
  
  &.m3-button--large {
    padding: 12px 32px;
    min-height: 48px;
    @include m3-label-large;
  }
  
  // States
  &.m3-button--loading {
    position: relative;
    color: transparent;
    
    &::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      border: 2px solid currentColor;
      border-radius: 50%;
      border-top-color: transparent;
      animation: spin 1s linear infinite;
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

### **2. Layout Components**

#### **Card Component Styles**
```scss
// src/lib/components/card/card.component.scss
@import '../../theme/base-component';

.m3-card {
  @include base-component;
  @include m3-elevation(1);
  
  // Card specific styles
  background-color: var(--md-sys-color-surface);
  border-radius: 12px;
  padding: 16px;
  
  // Variants
  &.m3-card--elevated {
    @include m3-elevation(2);
  }
  
  &.m3-card--outlined {
    @include m3-elevation(0);
    border: 1px solid var(--md-sys-color-outline-variant);
  }
  
  // Card header
  .m3-card__header {
    padding-bottom: 16px;
    margin-bottom: 16px;
    border-bottom: 1px solid var(--md-sys-color-outline-variant);
    
    .m3-card__title {
      @include m3-title-large;
      color: var(--md-sys-color-on-surface);
      margin-bottom: 4px;
    }
    
    .m3-card__subtitle {
      @include m3-body-medium;
      color: var(--md-sys-color-on-surface-variant);
    }
  }
  
  // Card content
  .m3-card__content {
    .m3-card__text {
      @include m3-body-medium;
      color: var(--md-sys-color-on-surface);
      margin-bottom: 16px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  
  // Card actions
  .m3-card__actions {
    padding-top: 16px;
    margin-top: 16px;
    border-top: 1px solid var(--md-sys-color-outline-variant);
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
}
```

---

## 📱 **Responsive Design System**

### **1. Breakpoint System**

#### **Breakpoint Variables**
```scss
// src/lib/theme/breakpoints.scss
$breakpoints: (
  'xs': 0px,
  'sm': 600px,
  'md': 905px,
  'lg': 1240px,
  'xl': 1440px,
  'xxl': 1920px
);

// Breakpoint mixins
@mixin breakpoint-up($size) {
  $breakpoint: map-get($breakpoints, $size);
  @if $breakpoint {
    @media (min-width: $breakpoint) {
      @content;
    }
  }
}

@mixin breakpoint-down($size) {
  $breakpoint: map-get($breakpoints, $size);
  @if $breakpoint {
    @media (max-width: $breakpoint - 1px) {
      @content;
    }
  }
}

@mixin breakpoint-between($min, $max) {
  $min-breakpoint: map-get($breakpoints, $min);
  $max-breakpoint: map-get($breakpoints, $max);
  @if $min-breakpoint and $max-breakpoint {
    @media (min-width: $min-breakpoint) and (max-width: $max-breakpoint - 1px) {
      @content;
    }
  }
}
```

#### **Responsive Utilities**
```scss
// Responsive utility classes
.m3-responsive {
  // Mobile first approach
  width: 100%;
  padding: 16px;
  
  @include breakpoint-up('sm') {
    padding: 24px;
  }
  
  @include breakpoint-up('md') {
    padding: 32px;
  }
  
  @include breakpoint-up('lg') {
    padding: 40px;
  }
}

.m3-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
  
  @include breakpoint-up('sm') {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
  
  @include breakpoint-up('md') {
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
  }
  
  @include breakpoint-up('lg') {
    grid-template-columns: repeat(4, 1fr);
    gap: 40px;
  }
}
```

---

## 🌓 **Light & Dark Theme Toggling**

### **1. Simple Theme System**

#### **Theme Toggle Service**
```typescript
// src/lib/theme/theme-toggle.service.ts
import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'auto';

@Injectable({ providedIn: 'root' })
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
    
    // Set theme attribute for CSS targeting
    root.setAttribute('data-theme', theme);
    
    // Apply theme-specific CSS custom properties
    if (theme === 'dark') {
      this.applyDarkTheme();
    } else {
      this.applyLightTheme();
    }
    
    // Save theme preference
    this.saveTheme(theme);
  }
  
  private applyLightTheme(): void {
    const root = document.documentElement;
    
    // Light theme colors (default M3 colors)
    root.style.setProperty('--md-sys-color-primary', '#6750a4');
    root.style.setProperty('--md-sys-color-on-primary', '#ffffff');
    root.style.setProperty('--md-sys-color-primary-container', '#eaddff');
    root.style.setProperty('--md-sys-color-on-primary-container', '#21005d');
    
    root.style.setProperty('--md-sys-color-surface', '#fffbfe');
    root.style.setProperty('--md-sys-color-on-surface', '#1c1b1f');
    root.style.setProperty('--md-sys-color-background', '#fffbfe');
    root.style.setProperty('--md-sys-color-on-background', '#1c1b1f');
    
    root.style.setProperty('--md-sys-color-outline', '#79747e');
    root.style.setProperty('--md-sys-color-outline-variant', '#cac4d0');
  }
  
  private applyDarkTheme(): void {
    const root = document.documentElement;
    
    // Dark theme colors (M3 dark variant)
    root.style.setProperty('--md-sys-color-primary', '#d0bcff');
    root.style.setProperty('--md-sys-color-on-primary', '#381e72');
    root.style.setProperty('--md-sys-color-primary-container', '#4f378b');
    root.style.setProperty('--md-sys-color-on-primary-container', '#eaddff');
    
    root.style.setProperty('--md-sys-color-surface', '#1c1b1f');
    root.style.setProperty('--md-sys-color-on-surface', '#e6e1e5');
    root.style.setProperty('--md-sys-color-background', '#1c1b1f');
    root.style.setProperty('--md-sys-color-on-background', '#e6e1e5');
    
    root.style.setProperty('--md-sys-color-outline', '#938f99');
    root.style.setProperty('--md-sys-color-outline-variant', '#49454f');
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
```

---

## 🔧 **Implementation & Integration**

### **1. Shared Library Structure**

#### **Theme File Organization**
```
src/lib/
├── theme/
│   ├── index.ts                           # Public API exports
│   ├── theme-toggle.service.ts            # Simple theme toggle service
│   ├── scss/
│   │   ├── _m3-color-system.scss         # M3 color system
│   │   ├── _m3-typography.scss           # M3 typography system
│   │   ├── _m3-elevation.scss            # M3 elevation system
│   │   ├── _base-component.scss           # Base component styles
│   │   ├── _breakpoints.scss              # Breakpoint system
│   │   └── _utilities.scss                # Utility classes
│   └── components/
│       ├── button/
│       │   ├── button.component.ts
│       │   ├── button.component.scss
│       │   └── button.component.html
│       ├── card/
│       │   ├── card.component.ts
│       │   ├── card.component.scss
│       │   └── card.component.html
│       └── theme-toggle/
│           ├── theme-toggle.component.ts
│           └── theme-toggle.component.scss
```

### **2. Angular Integration**

#### **Shared Library Module**
```typescript
// src/lib/shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ThemeToggleService } from './theme/theme-toggle.service';

import { ButtonComponent } from './components/button/button.component';
import { CardComponent } from './components/card/card.component';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';

@NgModule({
  declarations: [
    ButtonComponent,
    CardComponent,
    ThemeToggleComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    ButtonComponent,
    CardComponent,
    ThemeToggleComponent
  ],
  providers: [
    ThemeToggleService
  ]
})
export class SharedModule { }
```

#### **Global Styles Integration**
```scss
// src/styles.scss
@import '~@angular/material/prebuilt-themes/indigo-pink.css';
@import './lib/theme/scss/m3-color-system';
@import './lib/theme/scss/m3-typography';
@import './lib/theme/scss/m3-elevation';
@import './lib/theme/scss/base-component';
@import './lib/theme/scss/breakpoints';
@import './lib/theme/scss/utilities';

// Global styles
* {
  box-sizing: border-box;
}

html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Roboto', sans-serif;
  background-color: var(--md-sys-color-background);
  color: var(--md-sys-color-on-background);
  transition: background-color 0.2s ease, color 0.2s ease;
}

// Utility classes
.m3-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
  
  @include breakpoint-up('sm') {
    padding: 0 24px;
  }
  
  @include breakpoint-up('md') {
    padding: 0 32px;
  }
}

.m3-spacing {
  &--xs { margin: 4px; }
  &--sm { margin: 8px; }
  &--md { margin: 16px; }
  &--lg { margin: 24px; }
  &--xl { margin: 32px; }
  &--xxl { margin: 48px; }
}
```

---

## 🧪 **Testing & Quality Assurance**

### **1. Theme Testing Strategy**

#### **Theme Toggle Testing**
```typescript
// src/lib/theme/theme-toggle.test.ts
import { TestBed } from '@angular/core/testing';
import { ThemeToggleService } from './theme-toggle.service';

describe('ThemeToggleService', () => {
  let service: ThemeToggleService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeToggleService);
  });
  
  it('should apply light theme correctly', () => {
    service.setThemeMode('light');
    
    const root = document.documentElement;
    expect(root.getAttribute('data-theme')).toBe('light');
  });
  
  it('should apply dark theme correctly', () => {
    service.setThemeMode('dark');
    
    const root = document.documentElement;
    expect(root.getAttribute('data-theme')).toBe('dark');
  });
  
  it('should toggle theme correctly', () => {
    service.setThemeMode('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    
    service.toggleTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    
    service.toggleTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
  
  it('should detect system theme preference', () => {
    // Mock system preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
    
    service.setThemeMode('auto');
    // Test system theme detection
  });
});
```

### **2. Accessibility Testing**

#### **Contrast Ratio Validation**
```typescript
// src/lib/theme/accessibility.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AccessibilityService {
  
  validateContrastRatio(foreground: string, background: string): boolean {
    const ratio = this.calculateContrastRatio(foreground, background);
    return ratio >= 4.5; // WCAG AA standard for normal text
  }
  
  private calculateContrastRatio(foreground: string, background: string): number {
    const fgLuminance = this.calculateLuminance(foreground);
    const bgLuminance = this.calculateLuminance(background);
    
    const lighter = Math.max(fgLuminance, bgLuminance);
    const darker = Math.min(fgLuminance, bgLuminance);
    
    return (lighter + 0.05) / (darker + 0.05);
  }
  
  private calculateLuminance(color: string): number {
    // Convert hex to RGB and calculate luminance
    const rgb = this.hexToRgb(color);
    const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255];
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      if (c <= 0.03928) return c / 12.92;
      return Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }
  
  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }
}
```

---

## 🎯 **Next Steps & Implementation**

### **Phase 1: Core Theme System**
1. **Implement M3 color system** with CSS custom properties and theme classes
2. **Create typography scale** with M3 specifications
3. **Set up elevation system** with shadow utilities
4. **Implement simple theme toggle service** for light/dark switching

### **Phase 2: Component Library**
1. **Create base component styles** with M3 principles
2. **Implement button components** with variants
3. **Build card components** with elevation system
4. **Add form components** with M3 styling

### **Phase 3: Advanced Features**
1. **System theme detection** with auto mode
2. **Theme persistence** in localStorage
3. **Responsive design system** with breakpoints
4. **Accessibility validation** for contrast ratios

---

## 🔗 **Related Documentation**

- **[Component Architecture](COMPONENT_ARCHITECTURE.md)** - Component design patterns
- **[Service Architecture](SERVICE_ARCHITECTURE.md)** - Service layer implementation
- **[Core Architecture](CORE_ARCHITECTURE.md)** - Core principles and workflow

---

*This styling architecture provides a comprehensive Material Design 3 implementation that ensures consistency, accessibility, and modern design across all application variants.*
