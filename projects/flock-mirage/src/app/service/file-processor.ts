import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FileService, ValidationResult } from 'shared';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileProcessor implements FileService {
  route: ActivatedRoute = inject(ActivatedRoute);
  archivedFile: File | null = null;

  validateArchive(archivedFile: File): Promise<ValidationResult> {
    this.archivedFile = archivedFile;
    return Promise.resolve({
      isValid: true,
      errors: [],
      warnings: [],
      timestamp: new Date(),
      field: undefined,
      value: undefined
    });
  }


  extractArchive(): Promise<boolean> {
    const deferredPromise = new Promise<boolean>((resolve, reject) => {
      // Simulate extraction logic
      setTimeout(() => {
        // use demo query parameter to determine if the extraction is successful
        const isDemo = this.route.snapshot.queryParams['extractionFailed'] === 'true';
        const isSuccess = !isDemo;
        if (isSuccess) {
          resolve(true);
        } else {
          reject(new Error('Extraction failed'));
        }
      }, environment.archiveExtractDelay);
    });
    return deferredPromise;
  }

}
