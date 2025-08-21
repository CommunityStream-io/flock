import { ProgressService } from './progress.service';

describe('Feature: Progress Service', () => {
  let service: ProgressService;

  beforeEach(() => {
    service = new ProgressService();
  });

  describe('Scenario: Status and percent', () => {
    it('Given default state, When checking values, Then status is idle and percent 0', () => {
      console.log('🔧 BDD: Progress service initialized');
      expect(service.status()()).toBe('idle');
      expect(service.percent()()).toBe(0);
      console.log('✅ BDD: Defaults correct');
    });

    it('Given running state, When setting percent > 100, Then it clamps to 100', () => {
      console.log('🔧 BDD: Set running state');
      service.setStatus('running');
      service.setPercent(150);
      console.log('⚙️ BDD: Clamp percent');
      expect(service.percent()()).toBe(100);
      console.log('✅ BDD: Percent clamped to 100');
    });
  });
});

