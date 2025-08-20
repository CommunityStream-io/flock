# Routing Implementation Plan - Bluesky Migration Application

## 📚 **Navigation**
- **[← Back to Overview](ARCHITECTURE_OVERVIEW.md)**
- **[Routing Architecture →](ROUTING_ARCHITECTURE.md)**

---

## 🎯 **Implementation Overview**

This document provides a practical implementation plan for the routing architecture, outlining the specific files, components, and services needed to implement the guided workflow system.

### **What We're Building**

1. **Route Guards** - Prevent unauthorized access to steps
2. **Step Layout** - Encapsulate stepper UI and prev/next actions driven by route data
3. **Step Validation Service** - Validate step completion
4. **Base Components** - Reusable step component patterns
5. **Route Configuration** - Define all application routes

---

## 🗂️ **File Structure & Implementation Order**

### **Phase 1: Core Services & Guards**

#### **1. Route Guards (`src/app/core/guards/`)**
```
src/app/core/guards/
├── upload-completion.guard.ts
├── auth-completion.guard.ts
├── config-completion.guard.ts
├── migration-completion.guard.ts
└── index.ts
```

#### **2. Step Layout & Route Data**
```
shared/lib/
├── step-layout/
│   ├── step-layout.ts
│   ├── step-layout.html
│   └── step-layout.css
```
The Step Layout hosts a router-outlet for steps, renders the `shared-step-navigation`, and reads `data.prev`/`data.next` from the active child route to expose Previous/Next actions. No dedicated NavigationService is needed.

#### **3. Route Configuration (`src/app/`)**
```
src/app/
├── app.routes.ts
├── app.config.ts
└── app.component.ts
```

### **Phase 2: Base Components & Interfaces**

#### **4. Base Components (`src/app/shared/components/`)**
```
src/app/shared/components/
├── base-step/
│   ├── base-step.component.ts
│   ├── base-step.component.html
│   └── base-step.component.scss
├── step-header/
│   ├── step-header.component.ts
│   ├── step-header.component.html
│   └── step-header.component.scss
└── index.ts
```

#### **5. Interfaces (`src/app/shared/interfaces/`)**
```
src/app/shared/interfaces/
├── routing/
│   ├── step-config.interface.ts
│   ├── navigation.interface.ts
│   └── validation.interface.ts
└── index.ts
```

### **Phase 3: Step Components**

#### **6. Individual Step Components (`src/app/features/migration/steps/`)**
```
src/app/features/migration/steps/
├── upload-step/
├── auth-step/
├── config-step/
├── execute-step/
├── complete-step/
└── index.ts
```

---

## 🔧 **Implementation Details**

### **1. Route Guards Implementation**

#### **uploadCompletionGuard**
```typescript
// src/app/core/guards/upload-completion.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ConfigService } from '../services/config.service';

export const uploadCompletionGuard: CanActivateFn = () => {
  const configService = inject(ConfigService);
  const router = inject(Router);
  
  const hasUploadData = configService.hasUploadData();
  
  if (!hasUploadData) {
    return router.createUrlTree(['/upload']);
  }
  
  return true;
};
```

#### **authCompletionGuard**
```typescript
// src/app/core/guards/auth-completion.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ConfigService } from '../services/config.service';

export const authCompletionGuard: CanActivateFn = () => {
  const configService = inject(ConfigService);
  const router = inject(Router);
  
  const hasUploadData = configService.hasUploadData();
  const hasAuthData = configService.hasAuthData();
  
  if (!hasUploadData) {
    return router.createUrlTree(['/upload']);
  }
  
  if (!hasAuthData) {
    return router.createUrlTree(['/auth']);
  }
  
  return true;
};
```

#### **configCompletionGuard**
```typescript
// src/app/core/guards/config-completion.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ConfigService } from '../services/config.service';

export const configCompletionGuard: CanActivateFn = () => {
  const configService = inject(ConfigService);
  const router = inject(Router);
  
  const hasUploadData = configService.hasUploadData();
  const hasAuthData = configService.hasAuthData();
  const hasConfigData = configService.hasConfigData();
  
  if (!hasUploadData) {
    return router.createUrlTree(['/upload']);
  }
  
  if (!hasAuthData) {
    return router.createUrlTree(['/auth']);
  }
  
  if (!hasConfigData) {
    return router.createUrlTree(['/config']);
  }
  
  return true;
};
```

#### **migrationCompletionGuard**
```typescript
// src/app/core/guards/migration-completion.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ProgressService } from '../services/progress.service';

export const migrationCompletionGuard: CanActivateFn = () => {
  const progressService = inject(ProgressService);
  const router = inject(Router);
  
  const hasCompletedMigration = progressService.hasCompletedMigration();
  
  if (!hasCompletedMigration) {
    return router.createUrlTree(['/execute']);
  }
  
  return true;
};
```

#### **Guards Index**
```typescript
// src/app/core/guards/index.ts
export { uploadCompletionGuard } from './upload-completion.guard';
export { authCompletionGuard } from './auth-completion.guard';
export { configCompletionGuard } from './config-completion.guard';
export { migrationCompletionGuard } from './migration-completion.guard';
```

### **2. Navigation Services Implementation**

#### **NavigationService**
```typescript
// src/app/core/services/navigation.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private readonly stepOrder = ['upload', 'auth', 'config', 'execute', 'complete'];

  constructor(
    private router: Router,
    private configService: ConfigService
  ) {}

  navigateToNextStep(currentStep: string): void {
    const nextStep = this.getNextStep(currentStep);
    
    if (this.canNavigateToStep(nextStep)) {
      this.router.navigate([nextStep]);
    }
  }

  navigateToPreviousStep(currentStep: string): void {
    const previousStep = this.getPreviousStep(currentStep);
    this.router.navigate([previousStep]);
  }

  canNavigateToStep(step: string): boolean {
    switch (step) {
      case 'upload':
        return true;
      case 'auth':
        return this.configService.hasUploadData();
      case 'config':
        return this.configService.hasUploadData() && this.configService.hasAuthData();
      case 'execute':
        return this.configService.hasCompleteConfig();
      case 'complete':
        return this.configService.hasMigrationResults();
      default:
        return false;
    }
  }

  private getNextStep(currentStep: string): string {
    const currentIndex = this.stepOrder.indexOf(currentStep);
    return this.stepOrder[currentIndex + 1] || 'complete';
  }

  private getPreviousStep(currentStep: string): string {
    const currentIndex = this.stepOrder.indexOf(currentStep);
    return this.stepOrder[currentIndex - 1] || 'upload';
  }
}
```

#### **StepValidationService**
```typescript
// src/app/core/services/step-validation.service.ts
import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { ValidationResult } from '../interfaces/validation.interface';

@Injectable({
  providedIn: 'root'
})
export class StepValidationService {
  constructor(private configService: ConfigService) {}

  validateStepCompletion(step: string): ValidationResult {
    switch (step) {
      case 'upload':
        return this.validateUploadStep();
      case 'auth':
        return this.validateAuthStep();
      case 'config':
        return this.validateConfigStep();
      case 'execute':
        return this.validateExecuteStep();
      case 'complete':
        return this.validateCompleteStep();
      default:
        return { isValid: false, errors: ['Unknown step'] };
    }
  }

  private validateUploadStep(): ValidationResult {
    const hasUploadData = this.configService.hasUploadData();
    const hasValidArchive = this.configService.hasValidArchive();
    
    if (!hasUploadData) {
      return { isValid: false, errors: ['No files uploaded'] };
    }
    
    if (!hasValidArchive) {
      return { isValid: false, errors: ['Invalid archive structure'] };
    }
    
    return { isValid: true, errors: [] };
  }

  private validateAuthStep(): ValidationResult {
    const hasUploadData = this.configService.hasUploadData();
    const hasAuthData = this.configService.hasAuthData();
    const isAuthenticated = this.configService.isAuthenticated();
    
    if (!hasUploadData) {
      return { isValid: false, errors: ['Upload step not completed'] };
    }
    
    if (!hasAuthData) {
      return { isValid: false, errors: ['Authentication not completed'] };
    }
    
    if (!isAuthenticated) {
      return { isValid: false, errors: ['Authentication failed'] };
    }
    
    return { isValid: true, errors: [] };
  }

  private validateConfigStep(): ValidationResult {
    const hasUploadData = this.configService.hasUploadData();
    const hasAuthData = this.configService.hasAuthData();
    const hasConfigData = this.configService.hasConfigData();
    
    if (!hasUploadData) {
      return { isValid: false, errors: ['Upload step not completed'] };
    }
    
    if (!hasAuthData) {
      return { isValid: false, errors: ['Authentication not completed'] };
    }
    
    if (!hasConfigData) {
      return { isValid: false, errors: ['Configuration not completed'] };
    }
    
    return { isValid: true, errors: [] };
  }

  private validateExecuteStep(): ValidationResult {
    const hasCompleteConfig = this.configService.hasCompleteConfig();
    
    if (!hasCompleteConfig) {
      return { isValid: false, errors: ['Configuration incomplete'] };
    }
    
    return { isValid: true, errors: [] };
  }

  private validateCompleteStep(): ValidationResult {
    const hasMigrationResults = this.configService.hasMigrationResults();
    
    if (!hasMigrationResults) {
      return { isValid: false, errors: ['No migration results available'] };
    }
    
    return { isValid: true, errors: [] };
  }
}
```

### **3. Route Configuration**

#### **App Routes**
```typescript
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { 
  UploadCompletionGuard, 
  AuthCompletionGuard, 
  ConfigCompletionGuard, 
  MigrationCompletionGuard 
} from './core/guards';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
    title: 'Bluesky Migration - Home'
  },
  {
    path: 'upload',
    component: UploadStepComponent,
    title: 'Upload Instagram Export',
    canActivate: []
  },
  {
    path: 'auth',
    component: AuthStepComponent,
    title: 'Bluesky Authentication',
    canActivate: [uploadCompletionGuard]
  },
  {
    path: 'config',
    component: ConfigStepComponent,
    title: 'Migration Configuration',
    canActivate: [uploadCompletionGuard, authCompletionGuard]
  },
  {
    path: 'execute',
    component: ExecuteStepComponent,
    title: 'Execute Migration',
    canActivate: [uploadCompletionGuard, authCompletionGuard, configCompletionGuard]
  },
  {
    path: 'complete',
    component: CompleteStepComponent,
    title: 'Migration Complete',
    canActivate: [migrationCompletionGuard]
  },
  {
    path: 'error',
    component: ErrorComponent,
    title: 'Error'
  },
  {
    path: 'help',
    component: HelpComponent,
    title: 'Help & Documentation'
  },
  {
    path: '**',
    redirectTo: '/'
  }
];
```

### **4. Base Components**

#### **BaseStepComponent**
```typescript
// src/app/shared/components/base-step/base-step.component.ts
import { Component, Input } from '@angular/core';
import { NavigationService } from '../../../core/services/navigation.service';
import { StepValidationService } from '../../../core/services/step-validation.service';
import { ValidationResult } from '../../../interfaces/validation.interface';

export abstract class BaseStepComponent {
  @Input() stepName: string = '';
  
  protected abstract canProceed(): boolean;
  protected abstract canGoBack(): boolean;
  protected abstract getStepData(): any;
  
  constructor(
    protected navigationService: NavigationService,
    protected stepValidationService: StepValidationService
  ) {}
  
  protected proceedToNext(): void {
    if (this.canProceed()) {
      this.navigationService.navigateToNextStep(this.stepName);
    }
  }
  
  protected goBack(): void {
    if (this.canGoBack()) {
      this.navigationService.navigateToPreviousStep(this.stepName);
    }
  }
  
  protected validateStep(): ValidationResult {
    return this.stepValidationService.validateStepCompletion(this.stepName);
  }
}
```

#### **StepHeaderComponent**
```typescript
// src/app/shared/components/step-header/step-header.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { ConfigService } from '../../../core/services/config.service';

@Component({
  selector: 'app-step-header',
  templateUrl: './step-header.component.html',
  styleUrls: ['./step-header.component.scss']
})
export class StepHeaderComponent implements OnInit {
  @Input() currentStep: string = '';
  
  steps = [
    { path: 'upload', title: 'Upload', completed: false },
    { path: 'auth', title: 'Authenticate', completed: false },
    { path: 'config', title: 'Configure', completed: false },
    { path: 'execute', title: 'Execute', completed: false },
    { path: 'complete', title: 'Complete', completed: false }
  ];
  
  constructor(private configService: ConfigService) {}
  
  ngOnInit() {
    this.updateStepCompletion();
  }
  
  private updateStepCompletion() {
    // Update completion status based on Config Service state
    this.steps[0].completed = this.configService.hasUploadData();
    this.steps[1].completed = this.configService.hasAuthData();
    this.steps[2].completed = this.configService.hasConfigData();
    this.steps[3].completed = this.configService.hasMigrationResults();
    this.steps[4].completed = this.configService.hasMigrationResults();
  }
}
```

### **5. Interfaces**

#### **Validation Interface**
```typescript
// src/app/shared/interfaces/validation.interface.ts
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface StepValidation {
  step: string;
  result: ValidationResult;
  timestamp: Date;
}
```

#### **Navigation Interface**
```typescript
// src/app/shared/interfaces/navigation.interface.ts
export interface StepNavigation {
  currentStep: string;
  canProceed: boolean;
  canGoBack: boolean;
  nextStep?: string;
  previousStep?: string;
}

export interface StepConfig {
  stepName: string;
  title: string;
  description: string;
  isRequired: boolean;
  prerequisites: string[];
}
```

---

## 🚀 **Implementation Steps**

### **Step 1: Create Core Services**
1. Create `src/app/core/services/` directory
2. Implement `NavigationService`
3. Implement `StepValidationService`
4. Add to `app.config.ts` providers

### **Step 2: Implement Route Guards**
1. Create `src/app/core/guards/` directory
2. Implement all four guards
3. Create guards index file
4. Test guard logic

### **Step 3: Set Up Route Configuration**
1. Update `app.routes.ts` with new routes
2. Add guards to route configurations
3. Test route navigation
4. Verify guard behavior

### **Step 4: Create Base Components**
1. Create `src/app/shared/components/` directory
2. Implement `BaseStepComponent`
3. Implement `StepHeaderComponent`
4. Add to shared module exports

### **Step 5: Implement Step Components**
1. Create step component directories
2. Extend `BaseStepComponent`
3. Implement step-specific logic
4. Add navigation controls

### **Step 6: Testing & Integration**
1. Write BDD tests for routing
2. Test navigation flows
3. Verify guard behavior
4. Test error scenarios

---

## 🧪 **Testing Strategy**

### **BDD Tests for Routing**
```typescript
// routing.bdd.spec.ts
describe('Feature: Migration Workflow Navigation', () => {
  describe('Scenario: User completes upload step', () => {
    it('Given user has uploaded files, When navigating to auth, Then access is granted', () => {
      // BDD implementation
    });
  });
  
  describe('Scenario: User skips upload step', () => {
    it('Given user has not uploaded files, When navigating to auth, Then redirect to upload', () => {
      // BDD implementation
    });
  });
});
```

### **Guard Testing**
```typescript
// guards.bdd.spec.ts
describe('Feature: Route Access Control', () => {
  describe('Scenario: Upload completion guard', () => {
    it('Given no upload data, When accessing protected route, Then redirect to upload', () => {
      // BDD implementation
    });
  });
});
```

---

## 🔗 **Related Documentation**

- **[Routing Architecture](ROUTING_ARCHITECTURE.md)** - Complete routing design
- **[Core Architecture](CORE_ARCHITECTURE.md)** - Core principles and workflow
- **[Component Architecture](COMPONENT_ARCHITECTURE.md)** - Component design patterns
- **[Testing Architecture](TESTING_ARCHITECTURE.md)** - Testing strategy and BDD methodology

---

*This implementation plan provides a clear roadmap for building the routing architecture, ensuring the guided workflow is implemented correctly with proper guards, navigation, and validation.*
