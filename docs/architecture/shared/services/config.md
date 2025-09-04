# ⚙️ ConfigService

> *"Like the dodo bird's nest, our ConfigService is the central foundation where all configuration lives and grows."*

## 🏗️ **Service Overview**

The ConfigService is the central configuration management system for the Flock migration application. It manages all configuration state, validation, and persistence across the entire migration workflow.

## 📋 **Interface Definition**

```typescript
export interface ConfigService {
  archivePath: string;
  blueskyCredentials: Credentials | null;
  simulate: boolean;
  testVideoMode: boolean;
  startDate: string;
  endDate: string;
  validateConfig(): Promise<boolean>;
  resetConfig(): Promise<void>;
}
```

## 🔧 **Implementation Details**

### **Core Properties**
- **archivePath**: Path to the uploaded Instagram archive
- **blueskyCredentials**: Bluesky authentication credentials
- **simulate**: Whether to run in simulation mode
- **testVideoMode**: Enable test video processing
- **startDate**: Migration start date filter
- **endDate**: Migration end date filter

### **Key Methods**
- **validateConfig()**: Validates current configuration state
- **resetConfig()**: Resets configuration to default values

## 🎯 **Usage Examples**

### **Basic Configuration**
```typescript
export class MyComponent {
  private config = inject<ConfigService>(CONFIG);
  
  ngOnInit() {
    // Set configuration values
    this.config.archivePath = '/path/to/archive.zip';
    this.config.simulate = true;
    this.config.startDate = '2023-01-01';
    this.config.endDate = '2023-12-31';
  }
}
```

### **Configuration Validation**
```typescript
export class MyComponent {
  private config = inject<ConfigService>(CONFIG);
  
  async validateAndProceed() {
    const isValid = await this.config.validateConfig();
    
    if (isValid) {
      // Proceed with migration
      this.router.navigate(['/migrate']);
    } else {
      // Show validation errors
      this.showValidationErrors();
    }
  }
}
```

## 🧪 **Testing Examples**

### **Unit Testing**
```typescript
describe('ConfigService', () => {
  let service: ConfigService;
  let mockLogger: jasmine.SpyObj<Logger>;
  
  beforeEach(() => {
    mockLogger = jasmine.createSpyObj('Logger', ['log', 'error']);
    service = new ConfigServiceImpl(mockLogger);
  });
  
  it('should validate configuration successfully', async () => {
    service.archivePath = '/test/archive.zip';
    service.blueskyCredentials = { username: 'test', password: 'test' };
    
    const result = await service.validateConfig();
    
    expect(result).toBe(true);
  });
  
  it('should reset configuration to defaults', async () => {
    service.archivePath = '/test/archive.zip';
    service.simulate = true;
    
    await service.resetConfig();
    
    expect(service.archivePath).toBe('');
    expect(service.simulate).toBe(false);
  });
});
```

### **BDD Testing**
```typescript
describe('Feature: Configuration Management', () => {
  describe('Scenario: Valid configuration setup', () => {
    it('Given valid credentials and archive, When config is validated, Then migration can proceed', () => {
      // Given: Set up valid configuration
      console.log('🔧 BDD: Setting up valid configuration');
      service.archivePath = '/test/archive.zip';
      service.blueskyCredentials = { username: 'test', password: 'test' };
      
      // When: Validate configuration
      console.log('⚙️ BDD: Validating configuration');
      const result = await service.validateConfig();
      
      // Then: Configuration should be valid
      console.log('✅ BDD: Configuration validation successful');
      expect(result).toBe(true);
    });
  });
});
```

## 🔗 **Dependencies**

- **Logger**: For logging configuration operations
- **LocalStorage**: For configuration persistence (browser)
- **File System**: For archive path validation (native)

## 🎯 **Key Features**

1. **Centralized State**: Single source of truth for all configuration
2. **Validation**: Comprehensive configuration validation
3. **Persistence**: Configuration state persistence
4. **Reset Capability**: Easy configuration reset
5. **Type Safety**: Full TypeScript type safety

---

*"Like the dodo bird's careful nest construction, our ConfigService provides a solid foundation for the entire migration journey."*
