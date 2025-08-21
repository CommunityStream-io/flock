import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { UploadStepComponent } from './upload-step';
import { StepNavigationComponent } from '../step-navigation/step-navigation';

describe('Feature: Upload Step', () => {
  let component: UploadStepComponent;
  let fixture: ComponentFixture<UploadStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadStepComponent, CommonModule, ReactiveFormsModule, RouterModule.forRoot([]), StepNavigationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UploadStepComponent);
    component = fixture.componentInstance;
  });

  describe('Scenario: Component initialization', () => {
    it('Given the component is created, When it initializes, Then it should render the upload form', () => {
      console.log('🔧 BDD: Upload step component is created');
      console.log('⚙️ BDD: Component initializes');
      fixture.detectChanges();
      console.log('✅ BDD: Upload step form renders');
      expect(fixture.nativeElement.querySelector('.upload-step')).toBeTruthy();
    });
  });

  describe('Scenario: File field validation', () => {
    it('Given no file selected, When validating, Then the form should be invalid', () => {
      console.log('🔧 BDD: No file selected');
      fixture.detectChanges();
      console.log('⚙️ BDD: Validate form');
      expect(component.form.invalid).toBeTrue();
      console.log('✅ BDD: Form is invalid as expected');
    });
  });

  describe('Scenario: Drag and drop interactions', () => {
    it('Given the drop zone, When dragging over, Then it should set drag-over state', () => {
      fixture.detectChanges();
      const dropZone: HTMLElement = fixture.nativeElement.querySelector('.drop-zone');
      const dragOverEvent = new DragEvent('dragover', { bubbles: true, cancelable: true });
      console.log('🔧 BDD: Prepare dragover event');
      dropZone.dispatchEvent(dragOverEvent);
      console.log('⚙️ BDD: Dispatch dragover');
      expect(component.isDragOver()).toBeTrue();
      console.log('✅ BDD: Drag over state true');
    });

    it('Given a non-zip file, When dropped, Then it should show an error and not set the control', () => {
      fixture.detectChanges();
      const dropZone: HTMLElement = fixture.nativeElement.querySelector('.drop-zone');
      const dataTransfer = new DataTransfer();
      const file = new File(['text content'], 'notes.txt', { type: 'text/plain' });
      dataTransfer.items.add(file);

      const dropEvent = new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer });
      console.log('🔧 BDD: Prepare drop event with non-zip');
      dropZone.dispatchEvent(dropEvent);
      fixture.detectChanges();
      console.log('⚙️ BDD: Dispatch drop with non-zip');
      expect(component.fileControl.value).toBeNull();
      expect(component.errorMessage()).toContain('.zip');
      console.log('✅ BDD: Error shown and control not set');
    });

    it('Given a zip file, When dropped, Then it should set the control and clear errors', () => {
      fixture.detectChanges();
      const dropZone: HTMLElement = fixture.nativeElement.querySelector('.drop-zone');
      const dataTransfer = new DataTransfer();
      const file = new File(['zip content'], 'export.zip', { type: 'application/zip' });
      dataTransfer.items.add(file);

      const dropEvent = new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer });
      console.log('🔧 BDD: Prepare drop event with zip');
      dropZone.dispatchEvent(dropEvent);
      fixture.detectChanges();
      console.log('⚙️ BDD: Dispatch drop with zip');
      expect(component.fileControl.value).toBeTruthy();
      expect(component.fileName()).toBe('export.zip');
      expect(component.errorMessage()).toBe('');
      console.log('✅ BDD: File set and no errors');
    });
  });
});

