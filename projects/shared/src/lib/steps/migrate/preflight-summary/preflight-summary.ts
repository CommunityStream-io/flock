import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigServiceImpl } from '../../../services/config';
import { FILE_PROCESSOR } from '../../../services';
import type { FileService } from '../../../services/interfaces/file';

@Component({
  selector: 'shared-preflight-summary',
  imports: [CommonModule],
  templateUrl: './preflight-summary.html',
  styleUrl: './preflight-summary.css'
})
export class PreflightSummary {
  private config = inject(ConfigServiceImpl);
  private fileService = inject(FILE_PROCESSOR) as FileService;

  get username(): string {
    const creds = this.config.getBlueskyCredentials();
    return creds?.username ?? '';
  }

  get archiveName(): string {
    const file = this.fileService.archivedFile;
    if (file) return file.name;
    const path = this.config.archivePath;
    return path ? path.split(/[\\\/]/).pop() || '' : '';
  }

  get simulate(): boolean {
    return this.config.simulate;
  }

  get dateRange(): string {
    const start = this.config.startDate;
    const end = this.config.endDate;
    if (!start && !end) return 'All time';
    if (start && end) return `${start} → ${end}`;
    if (start) return `${start} → now`;
    return `until ${end}`;
  }
}
