
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  timestamp: Date;
  field?: string;
  value?: any;
}

export interface FileService {
    validateArchive(path: string): Promise<ValidationResult>
    extractArchive(archivePath: string): Promise<boolean>
}