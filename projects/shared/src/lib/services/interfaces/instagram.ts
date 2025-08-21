import { ValidationResult } from "./file";

// TODO have results for the completion page
export interface ProcessingResult {
  success: boolean;
  message: string; 
}

export interface InstagramService {
  processInstagramData(path: string): Promise<ProcessingResult>;
  validateExportStructure(path: string): Promise<ValidationResult>;
}