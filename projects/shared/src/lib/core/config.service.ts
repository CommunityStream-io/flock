import { Injectable, Signal, WritableSignal, signal } from '@angular/core';

export interface MigrationConfig {
  migratePosts: boolean;
  migratePhotos: boolean;
  migrateVideos: boolean;
  migrateComments: boolean;
  maxItems: number | null;
}

const DEFAULT_CONFIG: MigrationConfig = {
  migratePosts: true,
  migratePhotos: true,
  migrateVideos: false,
  migrateComments: false,
  maxItems: null
};

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly _config: WritableSignal<MigrationConfig> = signal<MigrationConfig>({ ...DEFAULT_CONFIG });

  config(): Signal<MigrationConfig> {
    return this._config.asReadonly();
  }

  update(partial: Partial<MigrationConfig>): void {
    const current = this._config();
    this._config.set({ ...current, ...partial });
  }

  reset(): void {
    this._config.set({ ...DEFAULT_CONFIG });
  }
}

