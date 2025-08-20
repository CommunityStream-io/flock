import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { StepNavigationComponent } from '../step-navigation/step-navigation';

@Component({
  selector: 'shared-auth-step',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, StepNavigationComponent],
  templateUrl: './auth-step.html',
  styleUrl: './auth-step.css'
})
export class AuthStepComponent {
  private readonly formBuilder = inject(FormBuilder);

  readonly hidePassword = signal<boolean>(true);
  readonly form = this.formBuilder.nonNullable.group({
    handle: ['', [Validators.required]],
    appPassword: ['', [Validators.required, Validators.minLength(8)]]
  });

  togglePassword(): void {
    this.hidePassword.update(v => !v);
  }
}

