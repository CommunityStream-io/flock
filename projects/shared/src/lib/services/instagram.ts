import { Injectable } from '@angular/core';
import { MediaProcessResult } from '@straiforos/instagramtobluesky';
import { InstagramService, ValidationResult } from '../services';

@Injectable({
  providedIn: 'root'
})
export class Instagram implements InstagramService {
  validateExportStructure(path: string): Promise<ValidationResult> {
    throw new Error('Method not implemented.');
  }

  processInstagramData(path: string): Promise<MediaProcessResult[]> {
    throw new Error('Method not implemented.');
  }
}
