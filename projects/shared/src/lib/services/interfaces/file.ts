
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  timestamp: Date;
  field?: string;
  value?: any;
}

/**
 * Handles Unarchiving of files and validating an archive
 */
export interface FileService {
    validateArchive(path: string): Promise<ValidationResult>
    extractArchive(archivePath: string): Promise<boolean>
}