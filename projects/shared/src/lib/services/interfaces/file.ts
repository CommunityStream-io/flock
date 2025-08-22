
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
  /**
   * Whether the archive has been validated to move onto the next step
   */
  validated: boolean;

  /**
   * Validates an archive that it is a instagram archive
   * @param path - The path to the archive to validate
   */
    validateArchive(path: string): Promise<ValidationResult>

    /**
     * Extracts an archive using nodejs for desktop, or js for web version
     * @param archivePath - The path to the archive to extract
     * @see FileProcessor for a mock implementation in the mirage app
     */
    extractArchive(archivePath: string): Promise<boolean>
}