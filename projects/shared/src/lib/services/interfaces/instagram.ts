import { MediaProcessResult } from "../../types/instagramtobluesky";
import { ValidationResult } from "./file";

export interface InstagramService {
  /**
   * Processes the instagram data and posts to bluesky lexicons
   * @param path - The path to the instagram export to process
   */
  processInstagramData(path: string): Promise<MediaProcessResult[]>;

  /**
   * Validates the structure of an instagram export
   * @param path - The path to the instagram export to validate
   */
  validateExportStructure(path: string): Promise<ValidationResult>;
}