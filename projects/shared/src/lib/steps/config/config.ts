import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Component, inject, OnInit, OnDestroy, signal, computed, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { LOGGER, Logger } from '../../services';
import { ConfigServiceImpl } from '../../services/config';
import { ConfigHelpDialog, HelpDialogData } from './help-dialog/help-dialog';

@Component({
  selector: 'shared-config',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatCardModule,
    MatDialogModule
  ],
  templateUrl: './config.html',
  styleUrl: './config.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Config implements OnInit, OnDestroy {
  private logger = inject(LOGGER) as Logger;
  private configService = inject(ConfigServiceImpl);
  private cdr = inject(ChangeDetectorRef);
  private dialog = inject(MatDialog);

  private destroy$ = new Subject<void>();

  /**
   * Form group for configuration settings
   */
  public configForm = new FormGroup({
    startDate: new FormControl<string>('', [this.dateValidator.bind(this)]),
    endDate: new FormControl<string>('', [this.dateValidator.bind(this), this.endDateValidator.bind(this)]),
    testVideoMode: new FormControl<boolean>(false),
    simulationMode: new FormControl<boolean>(false)
  });

  /**
   * Check if form is valid
   */
  public isFormValid = computed(() => {
    return this.configForm.valid;
  });

  /**
   * Check if form is dirty
   */
  public isFormDirty = computed(() => {
    return this.configForm.dirty;
  });

  /**
   * Check if form is pristine
   */
  public isFormPristine = computed(() => {
    return this.configForm.pristine;
  });

  /**
   * Check if form is touched
   */
  public isFormTouched = computed(() => {
    return this.configForm.touched;
  });

  ngOnInit() {
    // Load existing configuration
    this.loadConfiguration();

    // Subscribe to form value changes
    this.configForm.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.saveConfiguration();
      this.cdr.markForCheck();
    });

    // Subscribe to form status changes
    this.configForm.statusChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load configuration from service
   */
  private loadConfiguration(): void {
    this.configForm.patchValue({
      startDate: this.configService.startDate,
      endDate: this.configService.endDate,
      testVideoMode: this.configService.testVideoMode,
      simulationMode: this.configService.simulate
    });
  }

  /**
   * Save configuration to service
   */
  private saveConfiguration(): void {
    if (this.configForm.valid) {
      const formValue = this.configForm.value;
      
      if (formValue.startDate) {
        this.configService.setStartDate(formValue.startDate);
      }
      
      if (formValue.endDate) {
        this.configService.setEndDate(formValue.endDate);
      }
      
      if (formValue.testVideoMode !== undefined && formValue.testVideoMode !== null) {
        this.configService.setTestVideoMode(formValue.testVideoMode);
      }
      
      if (formValue.simulationMode !== undefined && formValue.simulationMode !== null) {
        this.configService.setSimulate(formValue.simulationMode);
      }

      this.logger.workflow('Configuration saved');
    }
  }

  /**
   * Clear date fields
   */
  public clearDates(): void {
    this.configForm.patchValue({
      startDate: '',
      endDate: ''
    });
    this.logger.workflow('Date fields cleared');
  }

  /**
   * Reset form to default values
   */
  public resetForm(): void {
    this.configForm.patchValue({
      startDate: '',
      endDate: '',
      testVideoMode: false,
      simulationMode: false
    });
    this.logger.workflow('Form reset to defaults');
  }

  /**
   * Open help dialog
   */
  public openHelpDialog(type: 'date-range' | 'testing-options' | 'general' = 'general'): void {
    const dialogData: HelpDialogData = {
      title: this.getHelpDialogTitle(type),
      content: '',
      type: type
    };

    // Prevent body scroll when dialog opens
    document.body.classList.add('dialog-open');

    const dialogRef = this.dialog.open(ConfigHelpDialog, {
      data: dialogData,
      width: '500px',
      maxWidth: '90vw',
      disableClose: false,
      autoFocus: true,
      panelClass: 'help-dialog-panel'
    });

    dialogRef.afterClosed().subscribe(() => {
      // Restore body scroll when dialog closes
      document.body.classList.remove('dialog-open');
      this.logger.workflow('Help dialog closed');
    });

    this.logger.workflow('Help dialog opened');
  }

  private getHelpDialogTitle(type: string): string {
    switch (type) {
      case 'date-range':
        return 'Date Range Filtering Help';
      case 'testing-options':
        return 'Testing Options Help';
      case 'general':
      default:
        return 'Configuration Help';
    }
  }

  /**
   * Get start date validation error message
   */
  getStartDateErrorMessage(): string {
    const control = this.configForm.get('startDate');
    
    if (control?.hasError('required')) {
      return 'Start date is required';
    }
    
    if (control?.hasError('invalidDate')) {
      return 'Please enter a valid date';
    }
    
    if (control?.hasError('futureDate')) {
      return 'Start date cannot be in the future';
    }
    
    return '';
  }

  /**
   * Get end date validation error message
   */
  getEndDateErrorMessage(): string {
    const control = this.configForm.get('endDate');
    
    if (control?.hasError('required')) {
      return 'End date is required';
    }
    
    if (control?.hasError('invalidDate')) {
      return 'Please enter a valid date';
    }
    
    if (control?.hasError('futureDate')) {
      return 'End date cannot be in the future';
    }
    
    if (control?.hasError('beforeStartDate')) {
      return 'End date must be after start date';
    }
    
    return '';
  }

  /**
   * Date validator
   */
  private dateValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    
    if (!value) {
      return null; // Allow empty dates
    }
    
    // Check if it's a valid date
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return { invalidDate: true };
    }
    
    // Check if it's in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date > today) {
      return { futureDate: true };
    }
    
    return null;
  }

  /**
   * End date validator
   */
  private endDateValidator(control: AbstractControl): ValidationErrors | null {
    const endDateValue = control.value;
    
    if (!endDateValue) {
      return null; // Allow empty dates
    }
    
    // Get the parent form group to access start date
    const parent = control.parent;
    if (!parent) {
      return null;
    }
    
    const startDateValue = parent.get('startDate')?.value;
    
    if (!startDateValue) {
      return null; // Allow empty start date
    }
    
    const endDate = new Date(endDateValue);
    const startDate = new Date(startDateValue);
    
    if (endDate < startDate) {
      return { beforeStartDate: true };
    }
    
    return null;
  }
}
