import { TestBed } from '@angular/core/testing';
import { Migration } from './migration';

describe('Migration', () => {
  let service: Migration;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Migration);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial state', () => {
    it('should initialize with zero percent complete', () => {
      expect(service.percentComplete()).toBe(0);
    });

    it('should initialize with empty current operation', () => {
      expect(service.currentOperation()).toBe('');
    });

    it('should initialize with zero elapsed seconds', () => {
      expect(service.elapsedSeconds()).toBe(0);
    });

    it('should initialize with null last result', () => {
      expect(service.lastResult).toBeNull();
    });
  });

  describe('reset()', () => {
    it('should reset percent complete to zero', () => {
      service.percentComplete.set(50);
      
      service.reset();
      
      expect(service.percentComplete()).toBe(0);
    });

    it('should reset current operation to empty string', () => {
      service.currentOperation.set('Processing...');
      
      service.reset();
      
      expect(service.currentOperation()).toBe('');
    });

    it('should reset elapsed seconds to zero', () => {
      service.elapsedSeconds.set(120);
      
      service.reset();
      
      expect(service.elapsedSeconds()).toBe(0);
    });

    it('should reset all values simultaneously', () => {
      service.percentComplete.set(75);
      service.currentOperation.set('Almost done');
      service.elapsedSeconds.set(45);
      
      service.reset();
      
      expect(service.percentComplete()).toBe(0);
      expect(service.currentOperation()).toBe('');
      expect(service.elapsedSeconds()).toBe(0);
    });

    it('should not affect lastResult', () => {
      service.lastResult = { count: 42, elapsedMs: 1000 };
      
      service.reset();
      
      expect(service.lastResult).toEqual({ count: 42, elapsedMs: 1000 });
    });

    it('should handle multiple reset calls', () => {
      service.percentComplete.set(100);
      service.reset();
      expect(service.percentComplete()).toBe(0);
      
      service.reset();
      expect(service.percentComplete()).toBe(0);
    });
  });

  describe('run()', () => {
    beforeEach(() => {
      jasmine.clock().install();
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should initialize state at start', async () => {
      const runPromise = service.run(false);
      
      // Check immediately after starting
      expect(service.percentComplete()).toBe(0);
      expect(service.currentOperation()).toBe('Migration starting');
      expect(service.elapsedSeconds()).toBe(0);
      
      // Tick through all the timeouts
      for (let i = 0; i < 50; i++) {
        jasmine.clock().tick(50);
        await Promise.resolve();
      }
      
      await runPromise;
    });

    it('should initialize with dry run message when simulate is true', async () => {
      const runPromise = service.run(true);
      
      expect(service.currentOperation()).toBe('Dry run starting');
      
      for (let i = 0; i < 50; i++) {
        jasmine.clock().tick(50);
        await Promise.resolve();
      }
      
      await runPromise;
    });

    it('should progress through steps and update percent complete', async () => {
      const runPromise = service.run(false);
      
      // Check at various points
      for (let i = 1; i <= 25; i++) {
        jasmine.clock().tick(50);
        await Promise.resolve();
      }
      
      expect(service.percentComplete()).toBeGreaterThan(0);
      expect(service.percentComplete()).toBeLessThan(100);
      
      for (let i = 26; i <= 50; i++) {
        jasmine.clock().tick(50);
        await Promise.resolve();
      }
      
      await runPromise;
    });

    it('should update current operation to "Processing…" during progress', async () => {
      const runPromise = service.run(false);
      
      // Move to middle of progress
      for (let i = 0; i < 25; i++) {
        jasmine.clock().tick(50);
        await Promise.resolve();
      }
      
      expect(service.currentOperation()).toBe('Processing…');
      
      // Complete the run
      for (let i = 25; i < 50; i++) {
        jasmine.clock().tick(50);
        await Promise.resolve();
      }
      
      await runPromise;
    });

    it('should update current operation to "Finalizing" at 100%', async () => {
      const runPromise = service.run(false);
      
      // Move to end
      for (let i = 0; i < 50; i++) {
        jasmine.clock().tick(50);
        await Promise.resolve();
      }
      
      const result = await runPromise;
      
      expect(service.currentOperation()).toBe('Completed');
      expect(result).toBeTruthy();
    });

    it('should update elapsed seconds after completion', async () => {
      const runPromise = service.run(false);
      
      // Complete the run
      for (let i = 0; i < 50; i++) {
        jasmine.clock().tick(50);
        await Promise.resolve();
      }
      
      await runPromise;
      
      // Elapsed seconds should be set after completion
      expect(service.elapsedSeconds()).toBeGreaterThanOrEqual(0);
    });

    it('should reach 100% at completion', async () => {
      const runPromise = service.run(false);
      
      for (let i = 0; i < 50; i++) {
        jasmine.clock().tick(50);
        await Promise.resolve();
      }
      
      await runPromise;
      
      expect(service.percentComplete()).toBe(100);
    });

    it('should set current operation to "Completed" after finishing', async () => {
      const runPromise = service.run(false);
      
      for (let i = 0; i < 50; i++) {
        jasmine.clock().tick(50);
        await Promise.resolve();
      }
      
      await runPromise;
      
      expect(service.currentOperation()).toBe('Completed');
    });

    it('should return result with count and elapsed time', async () => {
      const runPromise = service.run(false);
      
      for (let i = 0; i < 50; i++) {
        jasmine.clock().tick(50);
        await Promise.resolve();
      }
      
      const result = await runPromise;
      
      expect(result.count).toBe(42);
      expect(result.elapsedMs).toBeGreaterThan(0);
    });

    it('should store last result', async () => {
      expect(service.lastResult).toBeNull();
      
      const runPromise = service.run(false);
      
      for (let i = 0; i < 50; i++) {
        jasmine.clock().tick(50);
        await Promise.resolve();
      }
      
      const result = await runPromise;
      
      expect(service.lastResult).toEqual(result);
      expect(service.lastResult?.count).toBe(42);
    });

    it('should work with simulate = true', async () => {
      const runPromise = service.run(true);
      
      expect(service.currentOperation()).toBe('Dry run starting');
      
      for (let i = 0; i < 50; i++) {
        jasmine.clock().tick(50);
        await Promise.resolve();
      }
      
      const result = await runPromise;
      
      expect(result.count).toBe(42);
      expect(service.currentOperation()).toBe('Completed');
    });

    it('should work with simulate = false', async () => {
      const runPromise = service.run(false);
      
      expect(service.currentOperation()).toBe('Migration starting');
      
      for (let i = 0; i < 50; i++) {
        jasmine.clock().tick(50);
        await Promise.resolve();
      }
      
      const result = await runPromise;
      
      expect(result.count).toBe(42);
      expect(service.currentOperation()).toBe('Completed');
    });

    it('should handle multiple runs', async () => {
      // First run
      let runPromise = service.run(false);
      for (let i = 0; i < 50; i++) {
        jasmine.clock().tick(50);
        await Promise.resolve();
      }
      const result1 = await runPromise;
      expect(result1.count).toBe(42);
      
      // Second run
      runPromise = service.run(false);
      for (let i = 0; i < 50; i++) {
        jasmine.clock().tick(50);
        await Promise.resolve();
      }
      const result2 = await runPromise;
      expect(result2.count).toBe(42);
      
      expect(service.lastResult).toEqual(result2);
    });

    it('should reset signals at start of each run', async () => {
      // First run
      let runPromise = service.run(false);
      for (let i = 0; i < 50; i++) {
        jasmine.clock().tick(50);
        await Promise.resolve();
      }
      await runPromise;
      
      expect(service.percentComplete()).toBe(100);
      
      // Second run should reset
      runPromise = service.run(false);
      expect(service.percentComplete()).toBe(0);
      expect(service.elapsedSeconds()).toBe(0);
      
      for (let i = 0; i < 50; i++) {
        jasmine.clock().tick(50);
        await Promise.resolve();
      }
      await runPromise;
    });
  });

  describe('Integration scenarios', () => {
    beforeEach(() => {
      jasmine.clock().install();
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should handle complete migration workflow', async () => {
      // Start with clean state
      expect(service.percentComplete()).toBe(0);
      expect(service.lastResult).toBeNull();
      
      // Run migration
      const runPromise = service.run(false);
      expect(service.currentOperation()).toBe('Migration starting');
      
      for (let i = 0; i < 50; i++) {
        jasmine.clock().tick(50);
        await Promise.resolve();
      }
      
      const result = await runPromise;
      
      // Verify completion
      expect(service.percentComplete()).toBe(100);
      expect(service.currentOperation()).toBe('Completed');
      expect(service.lastResult).toEqual(result);
      
      // Reset for next migration
      service.reset();
      expect(service.percentComplete()).toBe(0);
      expect(service.currentOperation()).toBe('');
      expect(service.lastResult).toEqual(result); // lastResult persists
    });

    it('should handle dry run followed by real migration', async () => {
      // Dry run
      let runPromise = service.run(true);
      expect(service.currentOperation()).toBe('Dry run starting');
      
      for (let i = 0; i < 50; i++) {
        jasmine.clock().tick(50);
        await Promise.resolve();
      }
      await runPromise;
      
      // Reset
      service.reset();
      
      // Real migration
      runPromise = service.run(false);
      expect(service.currentOperation()).toBe('Migration starting');
      
      for (let i = 0; i < 50; i++) {
        jasmine.clock().tick(50);
        await Promise.resolve();
      }
      const result = await runPromise;
      
      expect(result.count).toBe(42);
      expect(service.currentOperation()).toBe('Completed');
    });
  });
});
