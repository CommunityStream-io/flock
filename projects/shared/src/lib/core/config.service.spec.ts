import { ConfigService } from './config.service';

describe('Feature: Config Service', () => {
  let service: ConfigService;

  beforeEach(() => {
    service = new ConfigService();
  });

  describe('Scenario: Update and reset', () => {
    it('Given default config, When updating a field, Then the signal reflects the change', () => {
      console.log('🔧 BDD: Config service initialized');
      service.update({ migrateVideos: true });
      console.log('⚙️ BDD: Update migrateVideos');
      expect(service.config()().migrateVideos).toBeTrue();
      console.log('✅ BDD: Update reflected in signal');
    });

    it('Given updated config, When resetting, Then defaults are restored', () => {
      console.log('🔧 BDD: Config service updated');
      service.update({ migrateVideos: true });
      console.log('⚙️ BDD: Reset');
      service.reset();
      expect(service.config()().migrateVideos).toBeFalse();
      console.log('✅ BDD: Defaults restored');
    });
  });
});

