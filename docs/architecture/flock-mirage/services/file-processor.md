# 📁 FileProcessor Service

> *"Like the dodo bird's careful handling of its eggs, our FileProcessor safely manages the Instagram archive."*

## 🏗️ **Service Overview**

The FileProcessor is a Mirage-specific service that handles file processing operations in the browser environment. It implements the FileService interface with browser-specific functionality using JSZip for archive handling.

## 📋 **Interface Implementation**

```typescript
export class FileProcessor implements FileService {
  route: ActivatedRoute = inject(ActivatedRoute);
  archivedFile: File | null = null;

  validateArchive(archivedFile: File): Promise<ValidationResult>;
  extractArchive(): Promise<boolean>;
}
```

## 🔧 **Implementation Details**

### **File Validation**
- **File Type Check**: Validates ZIP file format
- **Size Validation**: Checks file size limits
- **Content Validation**: Verifies archive structure
- **Mock Support**: Always returns valid for testing

### **Archive Extraction**
- **JSZip Integration**: Uses JSZip for browser-based extraction
- **Demo Mode Support**: Supports test scenarios via query parameters
- **Error Simulation**: Can simulate extraction failures
- **Async Processing**: Handles large files efficiently

## 🎯 **Usage Examples**

### **File Validation**
```typescript
export class UploadStep {
  private fileProcessor = inject<FileService>(FILE_PROCESSOR);
  
  async onFileSelected(file: File) {
    try {
      const result = await this.fileProcessor.validateArchive(file);
      
      if (result.isValid) {
        this.logger.info('File validation successful');
        this.proceedToNextStep();
      } else {
        this.showValidationErrors(result.errors);
      }
    } catch (error) {
      this.logger.error('File validation failed', error);
      this.showError('File validation failed');
    }
  }
}
```

### **Archive Extraction**
```typescript
export class MigrateStep {
  private fileProcessor = inject<FileService>(FILE_PROCESSOR);
  
  async extractArchive() {
    try {
      const success = await this.fileProcessor.extractArchive();
      
      if (success) {
        this.logger.info('Archive extracted successfully');
        this.proceedWithMigration();
      } else {
        this.showError('Archive extraction failed');
      }
    } catch (error) {
      this.logger.error('Archive extraction error', error);
      this.showError('Archive extraction failed');
    }
  }
}
```

## 🧪 **Testing Examples**

### **Unit Testing**
```typescript
describe('FileProcessor', () => {
  let service: FileProcessor;
  let mockRoute: jasmine.SpyObj<ActivatedRoute>;
  
  beforeEach(() => {
    mockRoute = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: { queryParams: {} }
    });
    service = new FileProcessor(mockRoute, mockLogger);
  });
  
  it('should validate archive successfully', async () => {
    const file = new File(['test'], 'test.zip', { type: 'application/zip' });
    
    const result = await service.validateArchive(file);
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });
  
  it('should extract archive successfully in normal mode', async () => {
    mockRoute.snapshot.queryParams = {};
    
    const result = await service.extractArchive();
    
    expect(result).toBe(true);
  });
  
  it('should fail extraction in demo mode', async () => {
    mockRoute.snapshot.queryParams = { extractionFailed: 'true' };
    
    try {
      await service.extractArchive();
      fail('Expected extraction to fail');
    } catch (error) {
      expect(error.message).toBe('Extraction failed');
    }
  });
});
```

### **BDD Testing**
```typescript
describe('Feature: File Processing', () => {
  describe('Scenario: Successful archive validation', () => {
    it('Given a valid ZIP file, When validating archive, Then validation should succeed', () => {
      // Given: Set up valid ZIP file
      console.log('🔧 BDD: Setting up valid ZIP file');
      const file = new File(['test'], 'test.zip', { type: 'application/zip' });
      
      // When: Validate archive
      console.log('⚙️ BDD: Validating archive');
      const result = await service.validateArchive(file);
      
      // Then: Validation should succeed
      console.log('✅ BDD: Archive validation successful');
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });
  
  describe('Scenario: Demo mode extraction failure', () => {
    it('Given demo mode enabled, When extracting archive, Then extraction should fail', () => {
      // Given: Enable demo mode
      console.log('🔧 BDD: Enabling demo mode');
      mockRoute.snapshot.queryParams = { extractionFailed: 'true' };
      
      // When: Extract archive
      console.log('⚙️ BDD: Extracting archive in demo mode');
      
      // Then: Extraction should fail
      console.log('❌ BDD: Extraction failed as expected');
      expectAsync(service.extractArchive()).toBeRejectedWithError('Extraction failed');
    });
  });
});
```

## 🔗 **Dependencies**

- **ActivatedRoute**: For accessing query parameters
- **JSZip**: For browser-based archive handling
- **Logger**: For logging file operations
- **FileService Interface**: Implements shared interface

## 🎯 **Key Features**

1. **Browser Optimized**: Designed for browser environment
2. **JSZip Integration**: Uses JSZip for archive handling
3. **Demo Mode Support**: Built-in testing scenarios
4. **Mock Validation**: Always returns valid for testing
5. **Error Simulation**: Can simulate various failure modes

## 🚀 **Demo Mode Features**

### **Query Parameter Support**
- `?extractionFailed=true` - Simulates extraction failure
- `?validationFailed=true` - Simulates validation failure
- `?slowExtraction=true` - Simulates slow extraction

### **Testing Scenarios**
```typescript
// Test extraction failure
const url = '/migrate?extractionFailed=true';
this.router.navigate([url]);

// Test slow extraction
const url = '/migrate?slowExtraction=true';
this.router.navigate([url]);
```

## 🔧 **Configuration**

### **Environment Settings**
```typescript
// In environment files
export const environment = {
  archiveExtractDelay: 2000, // 2 second delay for demo
  maxFileSize: 100 * 1024 * 1024, // 100MB limit
  allowedFileTypes: ['application/zip']
};
```

---

*"Like the dodo bird's careful handling of its precious eggs, our FileProcessor ensures every archive is treated with the utmost care and attention."*
