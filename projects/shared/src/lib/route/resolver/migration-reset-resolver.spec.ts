import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';
import { migrationResetResolver } from './migration-reset-resolver';
import { MIGRATION, LOGGER } from '../../services';
import { MigrationService } from '../../services/interfaces/migration';
import { Logger } from '../../services/interfaces';

describe('migrationResetResolver', () => {
  let mockMigration: jasmine.SpyObj<MigrationService>;
  let mockLogger: jasmine.SpyObj<Logger>;

  const executeResolver: ResolveFn<void> = (...resolverParameters) => 
    TestBed.runInInjectionContext(() => migrationResetResolver(...resolverParameters));

  beforeEach(() => {
    mockMigration = jasmine.createSpyObj('MigrationService', ['reset']);
    mockLogger = jasmine.createSpyObj('Logger', ['log', 'error', 'workflow']);

    TestBed.configureTestingModule({
      providers: [
        { provide: MIGRATION, useValue: mockMigration },
        { provide: LOGGER, useValue: mockLogger }
      ]
    });
  });

  it('should resolve', () => {
    const result = executeResolver(null as any, null as any);
    expect(result).toBeUndefined();
  });

  describe('Migration state reset', () => {
    it('should call migration.reset()', () => {
      executeResolver(null as any, null as any);
      
      expect(mockMigration.reset).toHaveBeenCalled();
    });

    it('should log reset message', () => {
      executeResolver(null as any, null as any);
      
      expect(mockLogger.log).toHaveBeenCalledWith('Resetting migration state via resolver');
    });
  });

  describe('Edge cases', () => {
    it('should handle multiple consecutive resolver calls', () => {
      executeResolver(null as any, null as any);
      executeResolver(null as any, null as any);
      
      expect(mockMigration.reset).toHaveBeenCalledTimes(2);
    });
  });

  describe('Return value', () => {
    it('should always return undefined', () => {
      const result = executeResolver(null as any, null as any);
      expect(result).toBeUndefined();
    });
  });
});