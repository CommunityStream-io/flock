import { TestBed } from '@angular/core/testing';

import { SplashScreenLoading } from './splash-screen-loading';

describe('SplashScreenLoading', () => {
  let service: SplashScreenLoading;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SplashScreenLoading);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should initialize with loading false', () => {
      expect(service.isLoading.value).toBe(false);
    });

    it('should initialize with default message', () => {
      expect(service.message.value).toBe('*flap* *flap* *flap*');
    });
  });

  describe('show() method', () => {
    it('should set loading to true when showing', () => {
      service.show('Test message');
      expect(service.isLoading.value).toBe(true);
    });

    it('should set the provided message', () => {
      const testMessage = 'Authenticating with bsky.social';
      service.show(testMessage);
      expect(service.message.value).toBe(testMessage);
    });

    it('should update message when called multiple times', () => {
      service.show('First message');
      expect(service.message.value).toBe('First message');
      
      service.show('Second message');
      expect(service.message.value).toBe('Second message');
      expect(service.isLoading.value).toBe(true);
    });
  });

  describe('hide() method', () => {
    it('should set loading to false when hiding', () => {
      service.show('Test message');
      expect(service.isLoading.value).toBe(true);
      
      service.hide();
      expect(service.isLoading.value).toBe(false);
    });

    it('should reset message to default when hiding', () => {
      service.show('Custom message');
      expect(service.message.value).toBe('Custom message');
      
      service.hide();
      expect(service.message.value).toBe('*flap* *flap* *flap*');
    });

    it('should reset message to default even if not previously shown', () => {
      // Start with default message
      expect(service.message.value).toBe('*flap* *flap* *flap*');
      
      service.hide();
      expect(service.message.value).toBe('*flap* *flap* *flap*');
      expect(service.isLoading.value).toBe(false);
    });

    it('should handle multiple hide calls', () => {
      service.show('Test message');
      service.hide();
      expect(service.isLoading.value).toBe(false);
      expect(service.message.value).toBe('*flap* *flap* *flap*');
      
      service.hide();
      expect(service.isLoading.value).toBe(false);
      expect(service.message.value).toBe('*flap* *flap* *flap*');
    });
  });

  describe('Observable Behavior', () => {
    it('should emit loading state changes', (done) => {
      let emissionCount = 0;
      const expectedValues = [false, true, false];
      
      service.isLoading.subscribe(value => {
        expect(value).toBe(expectedValues[emissionCount]);
        emissionCount++;
        
        if (emissionCount === expectedValues.length) {
          done();
        }
      });
      
      service.show('Test message');
      service.hide();
    });

    it('should emit message changes', (done) => {
      let emissionCount = 0;
      const expectedValues = ['*flap* *flap* *flap*', 'Custom message', '*flap* *flap* *flap*'];
      
      service.message.subscribe(value => {
        expect(value).toBe(expectedValues[emissionCount]);
        emissionCount++;
        
        if (emissionCount === expectedValues.length) {
          done();
        }
      });
      
      service.show('Custom message');
      service.hide();
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete show/hide cycle', () => {
      // Initial state
      expect(service.isLoading.value).toBe(false);
      expect(service.message.value).toBe('*flap* *flap* *flap*');
      
      // Show with custom message
      service.show('Authenticating with bsky.social');
      expect(service.isLoading.value).toBe(true);
      expect(service.message.value).toBe('Authenticating with bsky.social');
      
      // Hide and reset
      service.hide();
      expect(service.isLoading.value).toBe(false);
      expect(service.message.value).toBe('*flap* *flap* *flap*');
    });

    it('should handle multiple show/hide cycles', () => {
      // First cycle
      service.show('First message');
      expect(service.isLoading.value).toBe(true);
      expect(service.message.value).toBe('First message');
      
      service.hide();
      expect(service.isLoading.value).toBe(false);
      expect(service.message.value).toBe('*flap* *flap* *flap*');
      
      // Second cycle
      service.show('Second message');
      expect(service.isLoading.value).toBe(true);
      expect(service.message.value).toBe('Second message');
      
      service.hide();
      expect(service.isLoading.value).toBe(false);
      expect(service.message.value).toBe('*flap* *flap* *flap*');
    });

    it('should handle rapid show/hide calls', () => {
      service.show('Message 1');
      service.show('Message 2');
      service.hide();
      service.show('Message 3');
      service.hide();
      
      expect(service.isLoading.value).toBe(false);
      expect(service.message.value).toBe('*flap* *flap* *flap*');
    });
  });
});
