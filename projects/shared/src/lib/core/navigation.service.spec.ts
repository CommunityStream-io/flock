import { NavigationService } from './navigation.service';

describe('Feature: Navigation Service', () => {
  let service: NavigationService;

  beforeEach(() => {
    service = new NavigationService();
  });

  describe('Scenario: Step order navigation', () => {
    it('Given a route in the middle, When computing next, Then it returns the following step', () => {
      console.log('🔧 BDD: Navigation service with route /auth');
      const next = service.next('/auth');
      console.log('⚙️ BDD: Compute next');
      expect(next).toBe('/config');
      console.log('✅ BDD: Next route computed correctly');
    });

    it('Given the first route, When computing prev, Then it returns null', () => {
      console.log('🔧 BDD: Navigation service with route /upload');
      const prev = service.prev('/upload');
      console.log('⚙️ BDD: Compute prev');
      expect(prev).toBeNull();
      console.log('✅ BDD: Previous route is null for first step');
    });
  });
});

