# Material 3 Theme System

This directory contains the Material 3 theme configuration for the Flock shared module, built using the official Angular Material theme-color schematic.

## Files

- **`theme_theme-colors.scss`** - Generated M3 color palettes using `ng generate @angular/material:theme-color`
- **`theme.scss`** - Main theme configuration using M3 theming
- **`styles.scss`** - Additional global styles and utility classes
- **`theme-toggle.ts`** - Service for switching between light/dark themes

## How It Was Generated

This theme was created using the official Angular Material schematic:

```bash
ng generate @angular/material:theme-color --primaryColor=#5DADEC
```

The generated color palettes are then integrated using Angular 20's M3 theming API with `mat.define-theme()`.

### Generated Color Palettes

The schematic automatically generated harmonious color palettes based on:
- **Primary**: #5DADEC (Blue) - Skyblue
- **Secondary**: #FF6B35 (Orange) - Monarch orange
- **Tertiary**: #2AA198 (Teal) - Fresh teal
- **Neutral**: Automatically generated for surfaces and text
- **Error**: Automatically generated for error states

### Material 3 Color Science

The generated palettes are optimized using [Material Color Utilities](https://github.com/material-foundation/material-color-utilities) to ensure:
- ✅ **Accessibility**: Sufficient contrast ratios for all color combinations
- ✅ **Harmony**: Colors that work together based on Material Design principles
- ✅ **Accessibility**: Following [accessible design guidelines](https://m3.material.io/foundations/designing/color-contrast)

## Usage

### 1. Import the Theme

In your main `styles.scss`:
```scss
@use '../shared/src/lib/theme/styles';
```

Or import just the theme:
```scss
@use '../shared/src/lib/theme/theme';
```

### 2. Use the Theme Toggle Service

```typescript
import { ThemeToggleService } from '@flock/shared';

@Component({...})
export class MyComponent {
  constructor(private themeService: ThemeToggleService) {}
  
  toggleTheme() {
    this.themeService.toggleTheme();
  }
  
  setThemeMode('auto' | 'light' | 'dark') {
    this.themeService.setThemeMode(mode);
  }
}
```

### 3. Use M3 Design Tokens

```scss
.my-component {
  background-color: var(--mat-sys-surface-container);
  color: var(--mat-sys-on-surface);
  box-shadow: var(--mat-sys-elevation-level2);
}
```

### 4. Use Utility Classes

```html
<div class="surface-container mat-elevation-z2">
  <h2 class="text-primary">Primary Text</h2>
  <p class="text-on-surface">Body text</p>
</div>
```

## Theme Modes

- **Light Theme**: Default theme with light surfaces
- **Dark Theme**: Dark theme with dark surfaces  
- **Auto**: Automatically follows system preference
- **High Contrast**: Automatically enabled when system preference is set

## Color Palette

- **Primary**: Blue (#5DADEC) - Main brand color
- **Secondary**: Orange (#FF6B35) - Accent color
- **Tertiary**: Teal (#2AA198) - Additional accent
- **Neutral**: Grays for surfaces and text
- **Error**: Red for error states

## M3 Features

✅ **Material 3 Design System** - Full M3 color tokens and elevation  
✅ **Light/Dark Theme Support** - Automatic theme switching  
✅ **High Contrast Mode** - Accessibility compliance  
✅ **Custom Color Palette** - Brand colors integrated  
✅ **M3 Typography** - Modern Material Design typography  
✅ **Surface Containers** - M3 surface hierarchy  
✅ **Elevation System** - M3 shadow system

## Advanced Theming

### High Contrast Support

The generated theme includes high contrast overrides that automatically activate when users prefer higher contrast:

```scss
// High contrast mode support
@media (prefers-contrast: high) {
  [data-theme="light"] {
    @include theme-colors.high-contrast-overrides(light);
  }
  
  [data-theme="dark"] {
    @include theme-colors.high-contrast-overrides(dark);
  }
}
```

### Angular 20 M3 Theming

The theme uses Angular 20's modern M3 theming API:

```scss
// Create M3 themes using the new API
$light-theme: mat.define-theme((
  color: (
    theme-type: light,
    primary: theme-colors.$primary-palette,
    tertiary: theme-colors.$tertiary-palette
  ),
  typography: (
    plain-family: Roboto,
    brand-family: Roboto,
    bold-weight: 700,
    medium-weight: 500,
    regular-weight: 400
  ),
  density: (scale: 0)
));

// Theme automatically switches between light/dark based on data-theme attribute
[data-theme="dark"] {
  @include mat.all-component-themes($dark-theme);
}
```

## Regenerating the Theme

To update colors or regenerate the theme:

```bash
# Generate new theme with different primary color
ng generate @angular/material:theme-color --primaryColor=#FF5722

# Generate with custom secondary and tertiary colors in shared lib
ng generate @angular/material:theme-color \
  --primaryColor=#5DADEC \
  --secondaryColor=#FF6B35 \
  --tertiaryColor=#2AA198 \
  --includeHighContrast=true
```

### Schematic Options

- **`primaryColor`** (required): Main brand color
- **`secondaryColor`** (optional): Custom secondary color
- **`tertiaryColor`** (optional): Custom tertiary color
- **`neutralColor`** (optional): Custom neutral color
- **`errorColor`** (optional): Custom error color
- **`includeHighContrast`** (optional): Include high contrast values
- **`directory`** (optional): Output directory
- **`isScss`** (optional): Generate SCSS (recommended) or CSS

## Best Practices

1. **Use SCSS**: Angular recommends SCSS for better error handling and future compatibility
2. **Include High Contrast**: Always include high contrast support for accessibility
3. **Test Both Themes**: Verify light and dark themes work correctly
4. **Use Design Tokens**: Prefer CSS custom properties over hardcoded colors
5. **Follow M3 Guidelines**: Use surface containers and elevation properly

## Resources

- [Material 3 Color Roles](https://m3.material.io/styles/color/roles)
- [Angular Material Theming Guide](https://material.angular.dev/guide/theming)
- [Material Color Utilities](https://github.com/material-foundation/material-color-utilities)
- [Science of Color Design](https://material.io/blog/science-of-color-design)
- [Accessible Design Guidelines](https://m3.material.io/foundations/designing/color-contrast)
