import { Injectable, inject } from '@angular/core';
import { FileService, ValidationResult, LOGGER, Logger, ConfigServiceImpl, SplashScreenLoading } from 'shared';
import { ElectronService } from '../electron/electron.service';
import { ExtractionProgressComponent } from '../../components/extraction-progress/extraction-progress.component';

/**
 * Native file processor for Flock Native
 * Uses Electron IPC to access native file system operations
 */
@Injectable({
  providedIn: 'root'
})
export class NativeFileProcessor implements FileService {
  private electronService = inject(ElectronService);
  private logger = inject<Logger>(LOGGER);
  private configService = inject(ConfigServiceImpl);
  private splashScreenLoading = inject(SplashScreenLoading);
  
  archivedFile: File | null = null;
  private selectedFilePath: string | null = null;
  private extractedArchivePath: string | null = null;

  /**
   * Get the extracted archive path
   */
  getExtractedArchivePath(): string | null {
    return this.extractedArchivePath;
  }

  /**
   * Logging helpers with service name prefix
   */
  private log(...args: any[]) {
    const message = args.join(' ');
    this.logger.log(`[NativeFileProcessor] ${message}`);
  }

  private error(...args: any[]) {
    const message = args.join(' ');
    this.logger.error(`[NativeFileProcessor] ${message}`);
  }

  /**
   * Opens native file picker and selects a file
   * @returns Promise<File> The selected file
   */
  async selectFile(): Promise<File | null> {
    try {
      const api = this.electronService.getAPI();
      const result = await api.selectFile();

      if (!result.success || result.canceled) {
        this.log('File selection canceled or failed');
        return null;
      }

      if (!result.filePath || !result.fileName) {
        throw new Error('Invalid file selection result');
      }

      // Store the file path for later use
      this.selectedFilePath = result.filePath;

      // Create a File object from the native file
      // Note: We create a pseudo-File object with metadata
      // The actual file data will be accessed via Electron when needed
      const file = new File(
        [], // Empty blob - actual data accessed via Electron
        result.fileName,
        {
          lastModified: result.lastModified ? new Date(result.lastModified).getTime() : Date.now()
        }
      );

      // Store size information separately since we can't set it on File object
      Object.defineProperty(file, 'size', {
        value: result.fileSize || 0,
        writable: false
      });

      // Store file path as a custom property
      Object.defineProperty(file, '__nativePath', {
        value: result.filePath,
        writable: false
      });

      this.archivedFile = file;
      this.log('File selected:', result.fileName, `(${result.fileSize} bytes)`);

      return file;
    } catch (error) {
      this.error('Error selecting file:', error);
      throw error;
    }
  }

  /**
   * Validates an Instagram archive
   * @param archivedFile The file to validate
   * @returns Promise<ValidationResult>
   */
  async validateArchive(archivedFile: File): Promise<ValidationResult> {
    try {
      this.archivedFile = archivedFile;

      // Get the native file path
      const filePath = this.getNativeFilePath(archivedFile);
      
      if (!filePath) {
        return {
          isValid: false,
          errors: ['Native file path not available. Please select a file using the native picker.'],
          warnings: [],
          timestamp: new Date()
        };
      }

      // Use Electron API to validate
      const api = this.electronService.getAPI();
      const result = await api.validateArchive(filePath);

      this.log('Archive validation result:', result.isValid ? '✅ Valid' : '❌ Invalid');
      if (result.errors.length > 0) {
        this.log('Validation errors:', result.errors);
      }
      if (result.warnings.length > 0) {
        this.log('Validation warnings:', result.warnings);
      }

      return result;
    } catch (error) {
      this.error('Error validating archive:', error);
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Unknown validation error'],
        warnings: [],
        timestamp: new Date()
      };
    }
  }

  /**
   * Extracts the Instagram archive
   * @returns Promise<boolean> True if extraction was successful
   */
  async extractArchive(): Promise<boolean> {
    try {
      if (!this.archivedFile) {
        throw new Error('No archive file selected');
      }

      const filePath = this.getNativeFilePath(this.archivedFile);
      
      if (!filePath) {
        throw new Error('Native file path not available');
      }

      this.log('Starting archive extraction...');
      this.log('File:', this.archivedFile.name);
      this.log('Size:', (this.archivedFile.size / (1024 * 1024)).toFixed(2), 'MB');

      // Set custom progress component for extraction
      // IMPORTANT: Show splash screen FIRST, then set component
      // This ensures the splash screen DOM is ready before component renders
      this.log('Showing splash screen');
      this.splashScreenLoading.show('Preparing extraction...');
      this.log('Splash screen shown, isLoading:', this.splashScreenLoading.isLoading.getValue());
      
      this.log('Setting ExtractionProgressComponent');
      this.splashScreenLoading.setComponent(ExtractionProgressComponent);
      this.log('Component set, current component:', this.splashScreenLoading.component.getValue());
      this.log('Splash screen component set and shown');

      const api = this.electronService.getAPI();
      
      // Note: Progress monitoring is now handled by ExtractionProgressService
      // which forwards events to ExtractionProgressComponent
      
      // Extract the archive (no output path - will use temp directory)
      this.log('Calling api.extractArchive()...');
      const result = await api.extractArchive(filePath);
      this.log('api.extractArchive() returned:', result);

      if (!result.success) {
        this.error('Extraction failed:', result.error);
        throw new Error(result.error || 'Extraction failed');
      }

      // Store the extracted archive path
      this.extractedArchivePath = result.outputPath || null;
      
      // Store in config service for use in migration
      if (this.extractedArchivePath) {
        this.configService.setArchivePath(this.extractedArchivePath);
        this.log('Archive extraction completed successfully');
        this.log('Extracted to:', this.extractedArchivePath);
        this.log('Path stored in config service');
      }
      
      this.log('Returning true from extractArchive()');
      return true;
    } catch (error) {
      this.error('Error extracting archive:', error);
      // Don't reset component here - let resolver handle it in finalize
      return false;
    }
  }

  /**
   * Gets the native file path from a File object
   * @param file The File object
   * @returns The native file path or null
   */
  private getNativeFilePath(file: File): string | null {
    // Check if file has native path property (set during selection)
    const nativePath = (file as any).__nativePath;
    if (nativePath) {
      return nativePath;
    }

    // Fall back to stored path if it's the same file
    if (this.archivedFile === file && this.selectedFilePath) {
      return this.selectedFilePath;
    }

    return null;
  }
}

