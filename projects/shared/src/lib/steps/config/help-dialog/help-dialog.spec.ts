import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { ConfigHelpDialog, HelpDialogData } from './help-dialog';

describe('ConfigHelpDialog', () => {
  let component: ConfigHelpDialog;
  let fixture: ComponentFixture<ConfigHelpDialog>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<ConfigHelpDialog>>;

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [ConfigHelpDialog, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { title: 'Test Help', content: '', type: 'general' } as HelpDialogData }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigHelpDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close dialog when onClose is called', () => {
    component.onClose();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should return appropriate help content for date-range type', () => {
    component.data.type = 'date-range';
    const content = component.getHelpContent();
    expect(content).toContain('Date Range Filtering');
    expect(content).toContain('Start Date');
    expect(content).toContain('End Date');
  });

  it('should return appropriate help content for testing-options type', () => {
    component.data.type = 'testing-options';
    const content = component.getHelpContent();
    expect(content).toContain('Testing Options');
    expect(content).toContain('Test Video Mode');
    expect(content).toContain('Simulation Mode');
  });

  it('should return appropriate help content for general type', () => {
    component.data.type = 'general';
    const content = component.getHelpContent();
    expect(content).toContain('Configuration Help');
    expect(content).toContain('Date Range');
    expect(content).toContain('Testing Options');
  });
});
