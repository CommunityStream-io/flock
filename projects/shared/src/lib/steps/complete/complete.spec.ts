import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Complete } from './complete';

describe('Complete', () => {
  let component: Complete;
  let fixture: ComponentFixture<Complete>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Complete]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Complete);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a shareOnSocial method', () => {
    expect(component.shareOnSocial).toBeDefined();
    expect(typeof component.shareOnSocial).toBe('function');
  });

  describe('shareOnSocial', () => {
    it('should use Web Share API when available', async () => {
      const mockShare = jasmine.createSpy('share').and.returnValue(Promise.resolve());
      spyOnProperty(navigator, 'share', 'get').and.returnValue(mockShare);

      component.shareOnSocial();

      expect(mockShare).toHaveBeenCalledWith(jasmine.objectContaining({
        title: 'Join the Fediverse!',
        text: jasmine.stringContaining('Flock'),
        url: 'https://bsky.app'
      }));
    });

    it('should fallback to clipboard when Web Share API is not available', async () => {
      spyOnProperty(navigator, 'share', 'get').and.returnValue(undefined);
      const mockClipboard = jasmine.createSpy('writeText').and.returnValue(Promise.resolve());
      spyOnProperty(navigator, 'clipboard', 'get').and.returnValue({ writeText: mockClipboard } as any);
      spyOn(window, 'alert');

      component.shareOnSocial();

      expect(mockClipboard).toHaveBeenCalled();
    });
  });
});
