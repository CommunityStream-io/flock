import { TestBed } from '@angular/core/testing';
import { Type } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { migrationResetResolver } from './migration-reset-resolver';
import { MIGRATION, LOGGER, SplashScreenLoading } from '../../services';
import { MigrationService } from '../../services/interfaces/migration';
import { Logger } from '../../services/interfaces';
import { BehaviorSubject } from 'rxjs';

describe('migrationResetResolver', () => {
  let mockMigration: jasmine.SpyObj<MigrationService>;
  let mockLogger: jasmine.SpyObj<Logger>;
  let mockLoading: any;
  let componentSubject: BehaviorSubject<Type<unknown> | null>;

  const executeResolver: ResolveFn<void> = (...resolverParameters) => 
    TestBed.runInInjectionContext(() => migrationResetResolver(...resolverParameters));

  beforeEach(() => {
    componentSubject = new BehaviorSubject<Type<unknown> | null>(null);
    
    mockMigration = jasmine.createSpyObj('MigrationService', ['reset']);
    mockLogger = jasmine.createSpyObj('Logger', ['log', 'error', 'workflow']);
    mockLoading = {
      component: componentSubject,
      setComponent: jasmine.createSpy('setComponent')
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: MIGRATION, useValue: mockMigration },
        { provide: LOGGER, useValue: mockLogger },
        { provide: SplashScreenLoading, useValue: mockLoading }
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

  describe('Component clearing logic', () => {
    it('should clear component when no component is set', () => {
      componentSubject.next(null);
      
      executeResolver(null as any, null as any);
      
      expect(mockLoading.setComponent).toHaveBeenCalledWith(null);
      expect(mockLogger.log).toHaveBeenCalledWith('Clearing component (not extraction)');
    });

    it('should clear component when component is not ExtractionProgress', () => {
      class SomeOtherComponent {}
      componentSubject.next(SomeOtherComponent as Type<unknown>);
      
      executeResolver(null as any, null as any);
      
      expect(mockLoading.setComponent).toHaveBeenCalledWith(null);
      expect(mockLogger.log).toHaveBeenCalledWith('Clearing component (not extraction)');
    });

    it('should NOT clear component when ExtractionProgress is active', () => {
      class ExtractionProgressComponent {}
      componentSubject.next(ExtractionProgressComponent as Type<unknown>);
      
      executeResolver(null as any, null as any);
      
      expect(mockLoading.setComponent).not.toHaveBeenCalled();
      expect(mockLogger.log).toHaveBeenCalledWith('Skipping component clear - extraction in progress');
    });

    it('should detect ExtractionProgress by name containing "ExtractionProgress"', () => {
      class MyExtractionProgressComponent {}
      componentSubject.next(MyExtractionProgressComponent as Type<unknown>);
      
      executeResolver(null as any, null as any);
      
      expect(mockLoading.setComponent).not.toHaveBeenCalled();
      expect(mockLogger.log).toHaveBeenCalledWith('Skipping component clear - extraction in progress');
    });

    it('should handle component with undefined name', () => {
      const componentWithoutName = {} as Type<unknown>;
      Object.defineProperty(componentWithoutName, 'name', { value: undefined });
      componentSubject.next(componentWithoutName);
      
      executeResolver(null as any, null as any);
      
      expect(mockLoading.setComponent).toHaveBeenCalledWith(null);
      expect(mockLogger.log).toHaveBeenCalledWith('Clearing component (not extraction)');
    });

    it('should handle component with null name', () => {
      const componentWithNullName = {} as Type<unknown>;
      Object.defineProperty(componentWithNullName, 'name', { value: null });
      componentSubject.next(componentWithNullName);
      
      executeResolver(null as any, null as any);
      
      expect(mockLoading.setComponent).toHaveBeenCalledWith(null);
      expect(mockLogger.log).toHaveBeenCalledWith('Clearing component (not extraction)');
    });

    it('should be case-sensitive when checking for ExtractionProgress', () => {
      class extractionprogressComponent {}
      componentSubject.next(extractionprogressComponent as Type<unknown>);
      
      executeResolver(null as any, null as any);
      
      // Should clear because it's lowercase
      expect(mockLoading.setComponent).toHaveBeenCalledWith(null);
    });
  });

  describe('Integration workflow', () => {
    it('should execute complete reset workflow with no component', () => {
      componentSubject.next(null);
      
      const result = executeResolver(null as any, null as any);
      
      expect(mockMigration.reset).toHaveBeenCalled();
      expect(mockLoading.setComponent).toHaveBeenCalledWith(null);
      expect(mockLogger.log).toHaveBeenCalledWith('Resetting migration state via resolver');
      expect(mockLogger.log).toHaveBeenCalledWith('Clearing component (not extraction)');
      expect(result).toBeUndefined();
    });

    it('should execute complete reset workflow with ExtractionProgress active', () => {
      class ExtractionProgressComponent {}
      componentSubject.next(ExtractionProgressComponent as Type<unknown>);
      
      const result = executeResolver(null as any, null as any);
      
      expect(mockMigration.reset).toHaveBeenCalled();
      expect(mockLoading.setComponent).not.toHaveBeenCalled();
      expect(mockLogger.log).toHaveBeenCalledWith('Resetting migration state via resolver');
      expect(mockLogger.log).toHaveBeenCalledWith('Skipping component clear - extraction in progress');
      expect(result).toBeUndefined();
    });

    it('should execute complete reset workflow with other component', () => {
      class MigrationProgressComponent {}
      componentSubject.next(MigrationProgressComponent as Type<unknown>);
      
      const result = executeResolver(null as any, null as any);
      
      expect(mockMigration.reset).toHaveBeenCalled();
      expect(mockLoading.setComponent).toHaveBeenCalledWith(null);
      expect(mockLogger.log).toHaveBeenCalledWith('Resetting migration state via resolver');
      expect(mockLogger.log).toHaveBeenCalledWith('Clearing component (not extraction)');
      expect(result).toBeUndefined();
    });
  });

  describe('Edge cases', () => {
    it('should handle multiple consecutive resolver calls', () => {
      executeResolver(null as any, null as any);
      executeResolver(null as any, null as any);
      
      expect(mockMigration.reset).toHaveBeenCalledTimes(2);
      expect(mockLoading.setComponent).toHaveBeenCalledTimes(2);
    });

    it('should handle component changes between resolver calls', () => {
      // First call with no component
      componentSubject.next(null);
      executeResolver(null as any, null as any);
      expect(mockLoading.setComponent).toHaveBeenCalledWith(null);
      
      // Second call with ExtractionProgress
      class ExtractionProgressComponent {}
      componentSubject.next(ExtractionProgressComponent as Type<unknown>);
      executeResolver(null as any, null as any);
      expect(mockLoading.setComponent).toHaveBeenCalledTimes(1); // Not called again
    });

    it('should always reset migration regardless of component state', () => {
      class ExtractionProgressComponent {}
      componentSubject.next(ExtractionProgressComponent as Type<unknown>);
      
      executeResolver(null as any, null as any);
      
      // Even with ExtractionProgress, migration should reset
      expect(mockMigration.reset).toHaveBeenCalled();
    });
  });

  describe('Return value', () => {
    it('should always return undefined', () => {
      const result = executeResolver(null as any, null as any);
      expect(result).toBeUndefined();
    });

    it('should return undefined even with ExtractionProgress active', () => {
      class ExtractionProgressComponent {}
      componentSubject.next(ExtractionProgressComponent as Type<unknown>);
      
      const result = executeResolver(null as any, null as any);
      expect(result).toBeUndefined();
    });
  });
});

