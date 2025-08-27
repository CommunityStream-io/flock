# Environment Configuration

This directory contains environment-specific configuration files for the flock-mirage application.

## Files

- `environment.interface.ts` - TypeScript interface defining the environment structure
- `environment.ts` - Default environment (development)
- `environment.test.ts` - Test environment configuration
- `environment.prod.ts` - Production environment configuration
- `index.ts` - Barrel export for easy importing

## Configuration Properties

### archiveExtractDelay
- **Type**: `number`
- **Unit**: milliseconds
- **Default Value**: `5000` (5 seconds)
- **Description**: Controls the delay for archive extraction operations

## Usage

### Importing Environment Configuration

```typescript
import { environment } from '../environments/environment';

// Access configuration values
const delay = environment.archiveExtractDelay;
const isProd = environment.production;
```

### Using in Services

```typescript
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MyService {
  
  getArchiveExtractDelay(): number {
    return environment.archiveExtractDelay;
  }
}
```

### Using in Components

```typescript
import { Component } from '@angular/core';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-my-component',
  template: '<div>Delay: {{ archiveExtractDelay }}ms</div>'
})
export class MyComponent {
  archiveExtractDelay = environment.archiveExtractDelay;
}
```

## Build Configurations

The application supports three build configurations:

- **development**: Uses `environment.ts` (default for `ng serve`)
- **test**: Uses `environment.test.ts` (for e2e testing)
- **production**: Uses `environment.prod.ts` (for production builds)

## Running with Test Environment

```bash
# Build with test configuration
ng build flock-mirage --configuration=test

# Serve with test configuration
ng serve flock-mirage --configuration=test

# Run e2e tests with test environment
npm run test:e2e
```

## Adding New Configuration Properties

1. Add the property to `environment.interface.ts`
2. Add the property to all environment files
3. Update this README with the new property documentation

Example:
```typescript
// environment.interface.ts
export interface Environment {
  production: boolean;
  archiveExtractDelay: number;
  newProperty: string; // Add new property
}

// environment.ts
export const environment: Environment = {
  production: false,
  archiveExtractDelay: 5000,
  newProperty: 'dev-value' // Add value
};
```
