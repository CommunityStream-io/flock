# 🧩 Shared Library Developer Guide

> *"Welcome to the nest, developer! This guide will help you understand how to work with our shared library and contribute to the flock's foundation."*

## 🚀 **Quick Start for Developers**

### **What You Need to Know**
- **Angular 17+** with standalone components
- **Material Design 3** theming system
- **TypeScript** interfaces and types
- **Reactive Forms** for data handling
- **Service patterns** for cross-app compatibility

### **Getting Started**
```bash
# Navigate to shared library
cd projects/shared

# Install dependencies (if needed)
npm install

# Build the library
ng build shared

# Watch for changes during development
ng build shared --watch
```

## 🏗️ **Library Structure Deep Dive**

### **Core Directories**
```
shared/src/lib/
├── components/           # Reusable UI components
├── services/            # Service interfaces & implementations
├── theme/               # Material Design theming
├── route/               # Routing & navigation utilities
├── interfaces/          # TypeScript types & interfaces
├── utils/               # Helper functions
└── constants/           # Shared constants & enums
```

### **Component Organization**
Each component follows this structure:
```
file-upload/
├── file-upload.component.ts      # Main component logic
├── file-upload.component.html    # Template
├── file-upload.component.scss    # Styles
├── file-upload.component.spec.ts # Unit tests
└── index.ts                      # Public API exports
```

## 🔧 **Working with Components**

### **Component Development Pattern**

#### **1. Interface-First Design**
```typescript
// Always start with the interface
export interface FileUploadConfig {
  maxFileSize: number;
  allowedTypes: string[];
  multiple: boolean;
}

// Then implement the component
@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './file-upload.component.html'
})
export class FileUploadComponent {
  @Input() config!: FileUploadConfig;
  @Output() filesSelected = new EventEmitter<File[]>();
  
  // Implementation...
}
```

#### **2. Input/Output Pattern**
- **@Input()** - Configuration and data from parent
- **@Output()** - Events and data back to parent
- **@ViewChild/@ContentChild** - For complex component interactions

#### **3. Form Integration**
```typescript
// Use reactive forms for data handling
export class FileUploadComponent {
  uploadForm = new FormGroup({
    files: new FormControl<File[]>([], Validators.required),
    description: new FormControl('')
  });

  onSubmit() {
    if (this.uploadForm.valid) {
      this.filesSelected.emit(this.uploadForm.value.files);
    }
  }
}
```

### **Component Testing Strategy**

#### **BDD-Style Testing**
```typescript
describe('Feature: File Upload', () => {
  describe('Scenario: Valid file selection', () => {
    it('Given valid files, When user selects files, Then files are accepted', () => {
      console.log('🔧 BDD: Setting up file upload component with valid config');
      const component = createComponent();
      
      console.log('⚙️ BDD: User selects valid files');
      const files = [new File([''], 'test.zip', { type: 'application/zip' })];
      component.selectFiles(files);
      
      console.log('✅ BDD: Files are accepted and form is valid');
      expect(component.uploadForm.valid).toBe(true);
      expect(component.uploadForm.get('files')?.value).toEqual(files);
    });
  });
});
```

#### **Testing Best Practices**
- **Test the interface, not the implementation**
- **Use TestBed for real component testing**
- **Mock external dependencies**
- **Test user interactions, not internal state**

## 🔌 **Working with Services**

### **Service Architecture Pattern**

#### **1. Interface Definition**
```typescript
// Define the contract first
export interface FileProcessingService {
  processFiles(files: File[]): Promise<FileProcessingResult>;
  validateArchive(path: string): Promise<ValidationResult>;
  extractArchive(archivePath: string): Promise<ExtractionResult>;
}
```

#### **2. Implementation Strategy**
```typescript
// Each app provides its own implementation
@Injectable({
  providedIn: 'root'
})
export class MvpFileProcessingService implements FileProcessingService {
  async processFiles(files: File[]): Promise<FileProcessingResult> {
    // MVP-specific implementation
    return this.simulateProcessing(files);
  }
  
  // Other methods...
}
```

#### **3. Service Registration**
```typescript
// App-specific providers
export const APP_PROVIDERS = [
  {
    provide: FileProcessingService,
    useClass: environment.production 
      ? WebFileProcessingService 
      : MvpFileProcessingService
  }
];
```

### **Service Testing**

#### **Mock Service Pattern**
```typescript
// Create mock services for testing
export class MockFileProcessingService implements FileProcessingService {
  processFiles = jasmine.createSpy('processFiles').and.returnValue(
    Promise.resolve({ success: true, processedFiles: [] })
  );
  
  // Other methods...
}

// Use in tests
TestBed.configureTestingModule({
  providers: [
    { provide: FileProcessingService, useClass: MockFileProcessingService }
  ]
});
```

## 🎨 **Working with Theming**

### **Theme System Architecture**

#### **CSS Custom Properties**
```scss
// Define theme variables
:root {
  --primary-color: #1976d2;
  --secondary-color: #dc004e;
  --background-color: #ffffff;
  --text-color: #000000;
}

// Use in components
.file-upload {
  background-color: var(--background-color);
  color: var(--text-color);
  border: 2px solid var(--primary-color);
}
```

#### **Theme Service Integration**
```typescript
// Inject theme service
constructor(private themeService: ThemeService) {}

// Listen for theme changes
ngOnInit() {
  this.themeService.currentTheme$.subscribe(theme => {
    this.updateComponentTheme(theme);
  });
}
```

### **Creating New Themes**

#### **Theme Definition**
```typescript
export interface Theme {
  name: string;
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
}

export const LIGHT_THEME: Theme = {
  name: 'light',
  primary: '#1976d2',
  secondary: '#dc004e',
  background: '#ffffff',
  surface: '#f5f5f5',
  text: '#000000'
};
```

#### **Theme Application**
```typescript
// Apply theme to document
applyTheme(theme: Theme) {
  Object.entries(theme).forEach(([key, value]) => {
    if (key !== 'name') {
      document.documentElement.style.setProperty(
        `--${key}-color`, 
        value
      );
    }
  });
}
```

## 🛤️ **Working with Routing**

### **Step-Based Navigation**

#### **Route Configuration**
```typescript
// Define step routes
export const MIGRATION_ROUTES: Route[] = [
  { path: 'upload', component: UploadStepComponent },
  { path: 'auth', component: AuthStepComponent },
  { path: 'config', component: ConfigStepComponent },
  { path: 'execute', component: ExecuteStepComponent },
  { path: 'complete', component: CompleteStepComponent }
];
```

#### **Step Navigation Service**
```typescript
@Injectable({
  providedIn: 'root'
})
export class StepNavigationService {
  private currentStep = signal<number>(0);
  
  nextStep() {
    if (this.canProceed()) {
      this.currentStep.update(step => step + 1);
      this.navigateToStep(this.currentStep());
    }
  }
  
  canProceed(): boolean {
    return this.isCurrentStepValid();
  }
}
```

### **Route Guards**

#### **Step Validation Guard**
```typescript
export const stepValidationGuard: CanActivateFn = (route, state) => {
  const stepService = inject(StepNavigationService);
  const configService = inject(ConfigService);
  
  const stepNumber = getStepNumber(route.routeConfig?.path);
  
  // Check if previous steps are complete
  for (let i = 0; i < stepNumber; i++) {
    if (!stepService.isStepComplete(i)) {
      return false;
    }
  }
  
  return true;
};
```

## 📦 **Building and Publishing**

### **Development Workflow**

#### **1. Local Development**
```bash
# Build shared library
ng build shared

# Watch for changes
ng build shared --watch

# Run tests
ng test shared
```

#### **2. Integration Testing**
```bash
# Test in consuming apps
ng serve flock-mirage
ng serve flock-murmur
ng serve flock-native
```

#### **3. Build Verification**
```bash
# Verify build output
ls dist/shared/

# Check bundle size
ng build shared --stats-json
```

### **Version Management**

#### **Semantic Versioning**
- **Patch** - Bug fixes, no breaking changes
- **Minor** - New features, backward compatible
- **Major** - Breaking changes

#### **Changelog Maintenance**
```markdown
# Changelog

## [1.2.0] - 2024-01-15
### Added
- New FileUploadComponent with drag-and-drop support
- Theme switching capabilities

### Changed
- Updated FileProcessingService interface

### Fixed
- Memory leak in progress tracking
```

## 🧪 **Testing Strategy**

### **Test Categories**

#### **1. Unit Tests**
- **Component Logic** - Input/output, form validation
- **Service Methods** - Business logic, error handling
- **Utility Functions** - Pure functions, edge cases

#### **2. Integration Tests**
- **Component Interaction** - Parent-child communication
- **Service Integration** - Service-to-service communication
- **Form Workflows** - Multi-step form validation

#### **3. BDD Tests**
- **User Scenarios** - End-to-end user workflows
- **Business Rules** - Migration validation logic
- **Error Handling** - User error scenarios

### **Testing Tools**

#### **Angular Testing Utilities**
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

// Configure testing module
TestBed.configureTestingModule({
  imports: [
    NoopAnimationsModule,
    // Component dependencies
  ],
  providers: [
    // Service mocks
  ]
});
```

#### **Test Data Factories**
```typescript
// Create test data consistently
export class TestDataFactory {
  static createFileUploadConfig(): FileUploadConfig {
    return {
      maxFileSize: 1024 * 1024, // 1MB
      allowedTypes: ['.zip', '.tar.gz'],
      multiple: false
    };
  }
  
  static createMockFile(): File {
    return new File(['test content'], 'test.zip', { type: 'application/zip' });
  }
}
```

## 🔍 **Debugging and Troubleshooting**

### **Common Issues**

#### **1. Component Not Rendering**
- Check `standalone: true` configuration
- Verify imports in consuming components
- Check console for Angular errors

#### **2. Service Injection Errors**
- Verify service is provided in module/app
- Check for circular dependencies
- Ensure service implements correct interface

#### **3. Theme Not Applying**
- Verify CSS custom properties are set
- Check theme service injection
- Ensure CSS variables are defined

### **Debug Tools**

#### **Angular DevTools**
- Component tree inspection
- Service state monitoring
- Change detection analysis

#### **Console Logging**
```typescript
// Use BDD-style logging for debugging
console.log('🔧 BDD: Component initialized with config:', this.config);
console.log('⚙️ BDD: Processing files:', files);
console.log('✅ BDD: Files processed successfully');
```

## 🚀 **Performance Optimization**

### **Bundle Size Management**

#### **Tree Shaking**
```typescript
// Use named exports for better tree shaking
export { FileUploadComponent } from './file-upload.component';
export { FileProcessingService } from './file-processing.service';

// Avoid default exports
// ❌ export default FileUploadComponent;
// ✅ export { FileUploadComponent };
```

#### **Lazy Loading**
```typescript
// Lazy load heavy components
const FileUploadComponent = () => import('./file-upload.component')
  .then(m => m.FileUploadComponent);
```

### **Change Detection**

#### **OnPush Strategy**
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ... other config
})
export class FileUploadComponent {
  // Use signals or observables for reactive updates
  private files = signal<File[]>([]);
  files$ = this.files.asReadonly();
}
```

## 📚 **Documentation Standards**

### **Code Documentation**

#### **JSDoc Comments**
```typescript
/**
 * Processes uploaded files according to the specified configuration.
 * 
 * @param files - Array of files to process
 * @param config - Processing configuration options
 * @returns Promise resolving to processing results
 * 
 * @example
 * ```typescript
 * const result = await fileService.processFiles(files, config);
 * console.log(`Processed ${result.processedCount} files`);
 * ```
 */
async processFiles(files: File[], config: ProcessingConfig): Promise<ProcessingResult> {
  // Implementation...
}
```

#### **README Files**
Each component should have a README explaining:
- Purpose and usage
- Input/output specifications
- Examples and demos
- Dependencies and requirements

### **API Documentation**

#### **Interface Documentation**
```typescript
/**
 * Configuration for file upload component.
 * 
 * @public
 */
export interface FileUploadConfig {
  /** Maximum file size in bytes */
  maxFileSize: number;
  
  /** Array of allowed file extensions */
  allowedTypes: string[];
  
  /** Whether multiple files can be selected */
  multiple: boolean;
}
```

## 🤝 **Contributing Guidelines**

### **Development Workflow**

#### **1. Feature Development**
```bash
# Create feature branch
git checkout -b feature/new-file-upload

# Make changes
# Add tests
# Update documentation

# Commit with conventional commits
git commit -m "feat: add drag-and-drop file upload component"

# Push and create PR
git push origin feature/new-file-upload
```

#### **2. Code Review Checklist**
- [ ] Tests pass (unit, integration, BDD)
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] Performance impact considered
- [ ] Accessibility requirements met

#### **3. Release Process**
```bash
# Update version
npm version patch|minor|major

# Build and test
ng build shared
ng test shared

# Publish
npm publish dist/shared/
```

---

## 🎯 **Next Steps**

### **For New Developers**
1. **Read the Architecture Overview** - Understand the big picture
2. **Explore Existing Components** - See patterns in action
3. **Run the Test Suite** - Verify everything works
4. **Make a Small Change** - Get familiar with the workflow

### **For Experienced Developers**
1. **Review Service Interfaces** - Identify improvement opportunities
2. **Optimize Performance** - Look for bundle size and runtime improvements
3. **Enhance Testing** - Add more BDD scenarios
4. **Document Patterns** - Share knowledge with the team

### **For Architects**
1. **Evaluate Service Patterns** - Ensure they meet future needs
2. **Review Component API** - Plan for extensibility
3. **Assess Performance** - Identify bottlenecks
4. **Plan Migration Paths** - Prepare for breaking changes

---

*"The shared library is our foundation - build it well, and the entire flock will soar higher. Happy coding, developer! 🦅✨"*
