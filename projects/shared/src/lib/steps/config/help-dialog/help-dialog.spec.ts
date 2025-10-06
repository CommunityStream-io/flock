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

  it('should display data title in template', () => {
    component.data.title = 'Test Help Title';
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Test Help Title');
  });

  it('should display appropriate help content based on type', () => {
    component.data.type = 'general';
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Configuration Help');
    expect(compiled.textContent).toContain('Date Range');
    expect(compiled.textContent).toContain('Testing Options');
  });

  it('should have correct dialog type', () => {
    component.data.type = 'date-range';
    expect(component.data.type).toBe('date-range');
  });
});
