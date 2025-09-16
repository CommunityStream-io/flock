
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  timestamp: Date;
  field?: string;
  value?: unknown;
}

/**
 * Handles Unarchiving of files and validating an archive
 */
export interface FileService {
  /**
   * The archived file
   */
  archivedFile: File | null;

  /**
   * Validates an archive that it is a instagram archive
   * @param archivedFile - The archived file to validate
   */
    validateArchive(archivedFile: File): Promise<ValidationResult>

    /**
     * Extracts an archive using nodejs for desktop, or js for web version
     */
    extractArchive(): Promise<boolean>
}