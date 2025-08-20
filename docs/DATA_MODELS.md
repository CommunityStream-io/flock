# Data Models - Bluesky Migration Application

## 📚 **Navigation**
- **[← Back to Overview](ARCHITECTURE_OVERVIEW.md)**
- **[Routing Architecture →](ROUTING_ARCHITECTURE.md)**
- **[Service Architecture →](SERVICE_ARCHITECTURE.md)**

---

## 🎯 **Data Model Overview**

This document defines the data models and interfaces for the Bluesky Migration Application, analyzing the CLI's `AppConfig` class and creating clean, consistent interfaces for the Angular frontend that will interface with the CLI via Electron.

### **Key Principles**
1. **Config-First Architecture** - All configuration drives the application behavior
2. **Step-Based Data Collection** - Each step contributes specific data to the overall config
3. **CLI Compatibility** - Models must map cleanly to CLI's `AppConfig` structure
4. **Type Safety** - Strong typing for all configuration and state data
5. **Validation** - Built-in validation rules for data integrity

---

## 🔍 **CLI Config Analysis**

### **Current CLI AppConfig Structure**

**📚 Source**: **[Migration Tools Architecture](MIGRATION_TOOLS_ARCHITECTURE.md)** - See "Configuration Management" section for full CLI config details

```typescript
// From instagram-to-bluesky/src/config.ts
export class AppConfig {
  private readonly testVideoMode: boolean;
  private readonly testImageMode: boolean;
  private readonly testImagesMode: boolean;        // ❌ Inconsistent naming
  private readonly testMixedMediaMode: boolean;    // ❌ Inconsistent naming
  private readonly simulate: boolean;
  private readonly minDate: Date | undefined;
  private readonly maxDate: Date | undefined;
  private readonly blueskyUsername: string;
  private readonly blueskyPassword: string;
  private readonly archiveFolder: string;
}
```

### **Identified Issues & Inconsistencies**

#### **1. Test Mode Naming Inconsistency**
- **`testVideoMode`** - Singular, clear
- **`testImageMode`** - Singular, clear  
- **`testImagesMode`** - Plural, inconsistent with others
- **`testMixedMediaMode`** - Long, inconsistent with others

#### **2. Missing Configuration Fields**
- No `batchSize` for migration control
- No `retryAttempts` for error handling
- No `sessionToken` for authentication state
- No `userInfo` for authenticated user details

#### **3. Validation Logic Gaps**
- Test mode validation only checks for multiple modes
- No validation for date range logic (minDate < maxDate)
- No validation for archive folder structure
- No validation for Bluesky handle format

---

## 🏗️ **Proposed Data Model Structure**

### **1. Core Configuration Interfaces**

#### **MigrationConfig (Complete Configuration)**
```typescript
// src/app/shared/interfaces/migration-config.interface.ts
export interface MigrationConfig {
  // Upload Step Data
  upload: UploadStepConfig;
  
  // Auth Step Data
  auth: AuthStepConfig;
  
  // Config Step Data
  config: ConfigStepConfig;
  
  // Execution State
  execution: ExecutionState;
  
  // Results & Progress
  results: MigrationResults;
}

export interface UploadStepConfig {
  archiveFolder: string;
  fileSize: number;
  fileCount: number;
  validationResults: ValidationResult[];
  processingStatus: 'pending' | 'processing' | 'completed' | 'error';
  archiveStructure: ArchiveStructure;
}

export interface AuthStepConfig {
  blueskyUsername: string;
  blueskyPassword: string;
  isAuthenticated: boolean;
  sessionToken?: string;
  userInfo?: BlueskyUserInfo;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'failed';
}

export interface ConfigStepConfig {
  // Date Range Configuration
  dateRange: DateRangeConfig;
  
  // Test Mode Configuration (Simplified & Consistent)
  testMode: TestModeConfig;
  
  // Migration Settings
  migrationSettings: MigrationSettings;
  
  // Validation State
  validationState: ValidationState;
}

export interface ExecutionState {
  isExecuting: boolean;
  currentStep: number;
  totalSteps: number;
  progress: number; // 0-100
  startTime?: Date;
  estimatedCompletion?: Date;
  errors: ExecutionError[];
}

export interface MigrationResults {
  totalPosts: number;
  successfulPosts: number;
  failedPosts: number;
  skippedPosts: number;
  postUrls: string[];
  errorSummary: ErrorSummary;
  completionTime: Date;
  duration: number; // milliseconds
}
```

### **2. Simplified Test Mode Configuration**

#### **TestModeConfig (Replaces Inconsistent CLI Fields)**
```typescript
// src/app/shared/interfaces/test-mode.interface.ts
export interface TestModeConfig {
  mode: TestMode;
  enabled: boolean;
  description: string;
  archivePath: string;
}

export type TestMode = 
  | 'none'
  | 'video'
  | 'image' 
  | 'images'
  | 'mixed-media'
  | 'custom';

export const TEST_MODE_CONFIGS: Record<TestMode, Omit<TestModeConfig, 'enabled' | 'archivePath'>> = {
  none: {
    mode: 'none',
    description: 'Production mode - use actual Instagram export',
    archivePath: ''
  },
  video: {
    mode: 'video',
    description: 'Test with sample video posts',
    archivePath: 'transfer/test_video'
  },
  image: {
    mode: 'image',
    description: 'Test with sample image posts',
    archivePath: 'transfer/test_image'
  },
  images: {
    mode: 'images',
    description: 'Test with multiple sample images',
    archivePath: 'transfer/test_images'
  },
  mixed-media: {
    mode: 'mixed-media',
    description: 'Test with mixed media types',
    archivePath: 'transfer/test_mixed_media'
  },
  custom: {
    mode: 'custom',
    description: 'Custom test configuration',
    archivePath: ''
  }
};
```

### **3. Date Range & Validation Interfaces**

#### **DateRangeConfig**
```typescript
// src/app/shared/interfaces/date-range.interface.ts
export interface DateRangeConfig {
  minDate?: Date;
  maxDate?: Date;
  useDateRange: boolean;
  validation: DateRangeValidation;
}

export interface DateRangeValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  archiveDataRange?: {
    earliestPost: Date;
    latestPost: Date;
    totalPosts: number;
  };
}

export interface DateRangeValidationRules {
  minDateRequired: boolean;
  maxDateRequired: boolean;
  maxRangeDays: number; // e.g., 365 days
  allowFutureDates: boolean;
  requireArchiveOverlap: boolean;
}
```

#### **ValidationResult Interface**
```typescript
// src/app/shared/interfaces/validation.interface.ts
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  timestamp: Date;
  field?: string;
  value?: any;
}

export interface ValidationState {
  overall: ValidationResult;
  upload: ValidationResult;
  auth: ValidationResult;
  config: ValidationResult;
  execution: ValidationResult;
}
```

### **4. Migration Settings Interface**

#### **MigrationSettings**
```typescript
// src/app/shared/interfaces/migration-settings.interface.ts
export interface MigrationSettings {
  // Batch Processing
  batchSize: number;
  batchDelay: number; // milliseconds between batches
  
  // Retry Logic
  retryAttempts: number;
  retryDelay: number; // milliseconds between retries
  
  // Media Processing
  mediaProcessing: MediaProcessingConfig;
  
  // Error Handling
  errorHandling: ErrorHandlingConfig;
  
  // Performance
  performance: PerformanceConfig;
}

export interface MediaProcessingConfig {
  processImages: boolean;
  processVideos: boolean;
  processStories: boolean;
  processReels: boolean;
  imageQuality: 'low' | 'medium' | 'high';
  videoQuality: 'low' | 'medium' | 'high';
  maxFileSize: number; // bytes
}

export interface ErrorHandlingConfig {
  continueOnError: boolean;
  logErrors: boolean;
  retryOnNetworkError: boolean;
  maxConsecutiveErrors: number;
}

export interface PerformanceConfig {
  maxConcurrentRequests: number;
  requestTimeout: number; // milliseconds
  enableProgressTracking: boolean;
  enableDetailedLogging: boolean;
}
```

---

## 🔄 **Data Flow & State Management**

### **Step-by-Step Data Collection**

#### **1. Upload Step → UploadStepConfig**
```typescript
// User uploads Instagram export ZIP
const uploadConfig: UploadStepConfig = {
  archiveFolder: '/path/to/extracted/archive',
  fileSize: 1024000, // 1MB
  fileCount: 150,
  validationResults: [
    { isValid: true, field: 'archive', message: 'Valid Instagram export structure' }
  ],
  processingStatus: 'completed',
  archiveStructure: {
    hasPosts: true,
    hasStories: false,
    hasReels: true,
    postCount: 150,
    mediaCount: 300
  }
};
```

#### **2. Auth Step → AuthStepConfig**
```typescript
// User authenticates with Bluesky
const authConfig: AuthStepConfig = {
  blueskyUsername: 'user.bsky.social',
  blueskyPassword: 'app-password-123',
  isAuthenticated: true,
  sessionToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  userInfo: {
    did: 'did:plc:abc123',
    handle: 'user.bsky.social',
    displayName: 'User Name',
    avatar: 'https://...'
  },
  connectionStatus: 'connected'
};
```

#### **3. Config Step → ConfigStepConfig**
```typescript
// User configures migration settings
const configConfig: ConfigStepConfig = {
  dateRange: {
    minDate: new Date('2023-01-01'),
    maxDate: new Date('2023-12-31'),
    useDateRange: true,
    validation: { isValid: true, errors: [], warnings: [] }
  },
  testMode: {
    mode: 'none',
    enabled: false,
    description: 'Production mode - use actual Instagram export',
    archivePath: ''
  },
  migrationSettings: {
    batchSize: 10,
    batchDelay: 1000,
    retryAttempts: 3,
    retryDelay: 5000,
    mediaProcessing: {
      processImages: true,
      processVideos: true,
      processStories: false,
      processReels: true,
      imageQuality: 'high',
      videoQuality: 'medium',
      maxFileSize: 10485760 // 10MB
    }
  }
};
```

---

## 🔗 **CLI Integration Mapping**

### **CLI AppConfig to Angular MigrationConfig**

**📚 Related**: **[Migration Tools Architecture](MIGRATION_TOOLS_ARCHITECTURE.md)** - Detailed CLI tool architecture and processing strategies

### **Data Model to CLI Architecture Mapping**

#### **1. Upload Step → CLI Media Processing**
- **`UploadStepConfig.archiveStructure`** maps to CLI's `InstagramMediaProcessor` post analysis
- **`UploadStepConfig.validationResults`** maps to CLI's data validation in `instagram-to-bluesky.ts`
- **`UploadStepConfig.processingStatus`** tracks CLI's media processing pipeline

#### **2. Auth Step → CLI Bluesky Integration**
- **`AuthStepConfig.blueskyUsername/password`** maps to CLI's `BlueskyClient.login()`
- **`AuthStepConfig.sessionToken`** corresponds to CLI's authenticated client state
- **`AuthStepConfig.connectionStatus`** reflects CLI's Bluesky API connectivity

#### **3. Config Step → CLI Configuration Management**
- **`ConfigStepConfig.testMode`** maps to CLI's test mode environment variables
- **`ConfigStepConfig.dateRange`** maps to CLI's `MIN_DATE`/`MAX_DATE` filtering
- **`ConfigStepConfig.migrationSettings`** maps to CLI's processing strategies and rate limiting

#### **4. Execution State → CLI Progress Tracking**
- **`ExecutionState.progress`** maps to CLI's `calculateEstimatedTime()` and progress logging
- **`ExecutionState.errors`** maps to CLI's error handling and retry logic
- **`ExecutionState.currentStep`** tracks CLI's migration orchestration steps

#### **5. Migration Results → CLI Output**
- **`MigrationResults.postUrls`** maps to CLI's `createPost()` return values
- **`MigrationResults.successfulPosts`** counts CLI's successful media uploads
- **`MigrationResults.errorSummary`** aggregates CLI's error logging and validation failures

#### **Mapping Function**
```typescript
// src/app/core/services/cli-config-mapper.service.ts
@Injectable({ providedIn: 'root' })
export class CliConfigMapperService {
  
  // Convert Angular config to CLI environment variables
  toCliEnvironment(config: MigrationConfig): Record<string, string> {
    const env: Record<string, string> = {};
    
    // Test mode mapping
    if (config.config.testMode.enabled) {
      switch (config.config.testMode.mode) {
        case 'video':
          env.TEST_VIDEO_MODE = '1';
          break;
        case 'image':
          env.TEST_IMAGE_MODE = '1';
          break;
        case 'images':
          env.TEST_IMAGES_MODE = '1';
          break;
        case 'mixed-media':
          env.TEST_MIXED_MEDIA_MODE = '1';
          break;
      }
    }
    
    // Date range mapping
    if (config.config.dateRange.useDateRange) {
      if (config.config.dateRange.minDate) {
        env.MIN_DATE = config.config.dateRange.minDate.toISOString();
      }
      if (config.config.dateRange.maxDate) {
        env.MAX_DATE = config.config.dateRange.maxDate.toISOString();
      }
    }
    
    // Authentication mapping
    env.BLUESKY_USERNAME = config.auth.blueskyUsername;
    env.BLUESKY_PASSWORD = config.auth.blueskyPassword;
    
    // Archive folder mapping
    if (config.config.testMode.enabled) {
      env.ARCHIVE_FOLDER = config.config.testMode.archivePath;
    } else {
      env.ARCHIVE_FOLDER = config.upload.archiveFolder;
    }
    
    // Simulation mode (if needed)
    if (config.config.testMode.mode === 'none' && !config.auth.isAuthenticated) {
      env.SIMULATE = '1';
    }
    
    return env;
  }
  
  // Convert CLI AppConfig to Angular MigrationConfig
  fromCliConfig(cliConfig: any): Partial<MigrationConfig> {
    // Implementation for reading CLI config back into Angular
    // This would be used for configuration persistence and recovery
  }
}
```

---

## 🧪 **Validation Rules & Business Logic**

### **Configuration Validation Rules**

#### **1. Test Mode Validation**
```typescript
export const TEST_MODE_VALIDATION_RULES = {
  // Only one test mode can be enabled at a time
  singleModeOnly: (config: TestModeConfig[]): boolean => {
    const enabledModes = config.filter(mode => mode.enabled);
    return enabledModes.length <= 1;
  },
  
  // Custom mode requires archive path
  customModeRequiresPath: (config: TestModeConfig): boolean => {
    if (config.mode === 'custom' && config.enabled) {
      return config.archivePath.length > 0;
    }
    return true;
  }
};
```

#### **2. Date Range Validation**
```typescript
export const DATE_RANGE_VALIDATION_RULES = {
  // Min date must be before max date
  validRange: (minDate: Date, maxDate: Date): boolean => {
    return minDate < maxDate;
  },
  
  // Date range cannot exceed maximum allowed
  maxRangeExceeded: (minDate: Date, maxDate: Date, maxDays: number): boolean => {
    const diffTime = maxDate.getTime() - minDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= maxDays;
  },
  
  // Dates must be within archive data range
  withinArchiveRange: (date: Date, archiveRange: DateRange): boolean => {
    return date >= archiveRange.earliestPost && date <= archiveRange.latestPost;
  }
};
```

#### **3. Authentication Validation**
```typescript
export const AUTH_VALIDATION_RULES = {
  // Username must be valid Bluesky handle format
  validHandle: (username: string): boolean => {
    const handleRegex = /^[a-zA-Z0-9._-]+\.bsky\.social$/;
    return handleRegex.test(username);
  },
  
  // Password must not be empty
  passwordRequired: (password: string): boolean => {
    return password.length > 0;
  },
  
  // Session must be valid and not expired
  sessionValid: (sessionToken: string, userInfo: BlueskyUserInfo): boolean => {
    // Implementation would check token validity and expiration
    return sessionToken.length > 0 && !!userInfo;
  }
};
```

---

## 📁 **File Structure & Organization**

### **Interface File Organization**
```
src/app/shared/interfaces/
├── migration/
│   ├── migration-config.interface.ts      # Main configuration interface
│   ├── upload-step.interface.ts           # Upload step data
│   ├── auth-step.interface.ts             # Authentication data
│   ├── config-step.interface.ts           # Configuration data
│   └── execution.interface.ts             # Execution state
├── validation/
│   ├── validation.interface.ts            # Validation results
│   ├── validation-rules.interface.ts      # Validation rules
│   └── validation-state.interface.ts      # Overall validation state
├── test-mode/
│   ├── test-mode.interface.ts             # Test mode configuration
│   └── test-mode-configs.constant.ts      # Test mode definitions
├── date-range/
│   ├── date-range.interface.ts            # Date range configuration
│   └── date-range-validation.interface.ts # Date validation rules
├── migration-settings/
│   ├── migration-settings.interface.ts    # Migration configuration
│   ├── media-processing.interface.ts      # Media processing settings
│   └── performance.interface.ts           # Performance settings
└── index.ts                               # Public API exports
```

---

## 🔄 **State Persistence & Recovery**

### **Configuration Persistence Strategy**

#### **1. Local Storage for User Preferences**
```typescript
// src/app/core/services/config-persistence.service.ts
@Injectable({ providedIn: 'root' })
export class ConfigPersistenceService {
  
  // Save configuration to local storage
  saveConfig(config: MigrationConfig): void {
    const configData = {
      timestamp: new Date().toISOString(),
      config: this.sanitizeForStorage(config)
    };
    localStorage.setItem('migration-config', JSON.stringify(configData));
  }
  
  // Load configuration from local storage
  loadConfig(): Partial<MigrationConfig> | null {
    const stored = localStorage.getItem('migration-config');
    if (!stored) return null;
    
    try {
      const data = JSON.parse(stored);
      return this.desanitizeFromStorage(data.config);
    } catch (error) {
      console.error('Failed to load stored configuration:', error);
      return null;
    }
  }
  
  // Clear stored configuration
  clearConfig(): void {
    localStorage.removeItem('migration-config');
  }
  
  private sanitizeForStorage(config: MigrationConfig): any {
    // Remove sensitive data (passwords, tokens) before storage
    const sanitized = { ...config };
    if (sanitized.auth) {
      sanitized.auth.blueskyPassword = '';
      sanitized.auth.sessionToken = '';
    }
    return sanitized;
  }
  
  private desanitizeFromStorage(config: any): Partial<MigrationConfig> {
    // Restore configuration from storage
    return config;
  }
}
```

#### **2. Electron IPC for CLI Integration**
```typescript
// src/app/core/services/electron-config.service.ts
@Injectable({ providedIn: 'root' })
export class ElectronConfigService {
  
  // Send configuration to CLI via Electron
  async sendConfigToCli(config: MigrationConfig): Promise<void> {
    if (this.isElectron()) {
      const envVars = this.cliMapper.toCliEnvironment(config);
      await this.electronService.sendConfig(envVars);
    }
  }
  
  // Receive CLI execution results
  async getCliResults(): Promise<MigrationResults> {
    if (this.isElectron()) {
      return await this.electronService.getResults();
    }
    throw new Error('Not running in Electron environment');
  }
  
  private isElectron(): boolean {
    return !!(window as any).electronAPI;
  }
}
```

---

## 🎯 **Next Steps & Implementation**

### **Phase 1: Core Interfaces**
1. **Create interface files** following the proposed structure
2. **Implement validation rules** for each configuration section
3. **Create constants** for test modes and validation rules
4. **Set up index files** for clean imports

### **Phase 2: Configuration Services**
1. **Implement ConfigService** with the new interfaces
2. **Create validation services** for each configuration section
3. **Implement persistence service** for local storage
4. **Create CLI mapper service** for Electron integration

### **Phase 3: Integration & Testing**
1. **Update existing components** to use new interfaces
2. **Implement BDD tests** for configuration validation
3. **Test Electron integration** with CLI configuration
4. **Validate data flow** from UI to CLI execution
5. **Verify CLI mapping** against **[Migration Tools Architecture](MIGRATION_TOOLS_ARCHITECTURE.md)** specifications

---

## 🔗 **Related Documentation**

- **[Routing Architecture](ROUTING_ARCHITECTURE.md)** - Route flow and step prerequisites
- **[Service Architecture](SERVICE_ARCHITECTURE.md)** - Service layer implementation
- **[Core Architecture](CORE_ARCHITECTURE.md)** - Core principles and workflow
- **[Migration Tools Architecture](MIGRATION_TOOLS_ARCHITECTURE.md)** - CLI tool architecture and processing strategies
- **[CLI Integration](CLI_INTEGRATION.md)** - CLI tool integration strategy

---

*This data model provides a clean, consistent foundation for the migration application, addressing the CLI configuration inconsistencies while maintaining full compatibility for Electron integration.*
