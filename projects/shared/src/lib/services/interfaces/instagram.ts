import { MediaProcessResult } from "@straiforos/instagramtobluesky";
import { ValidationResult } from "./file";

export interface InstagramService {
  processInstagramData(path: string): Promise<MediaProcessResult>;
  validateExportStructure(path: string): Promise<ValidationResult>;
}