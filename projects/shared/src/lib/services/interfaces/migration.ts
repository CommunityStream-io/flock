

export interface MigrationService {
  migrateData(source: string, destination: string): Promise<void>;
}