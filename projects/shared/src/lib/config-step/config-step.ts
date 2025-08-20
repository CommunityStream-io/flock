import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { StepNavigationComponent } from '../step-navigation/step-navigation';
import { ConfigService } from '../core/config.service';

@Component({
  selector: 'shared-config-step',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MatCardModule, MatCheckboxModule, MatFormFieldModule, MatInputModule, MatButtonModule, StepNavigationComponent],
  templateUrl: './config-step.html',
  styleUrl: './config-step.css'
})
export class ConfigStepComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly configService = inject(ConfigService);

  readonly form = this.formBuilder.nonNullable.group({
    migratePosts: true,
    migratePhotos: true,
    migrateVideos: false,
    migrateComments: false,
    maxItems: 0
  });

  constructor() {
    effect(() => {
      const cfg = this.configService.config()();
      this.form.patchValue({
        migratePosts: cfg.migratePosts,
        migratePhotos: cfg.migratePhotos,
        migrateVideos: cfg.migrateVideos,
        migrateComments: cfg.migrateComments,
        maxItems: cfg.maxItems ?? 0
      }, { emitEvent: false });
    });

    this.form.valueChanges.subscribe(val => {
      this.configService.update({
        migratePosts: !!val.migratePosts,
        migratePhotos: !!val.migratePhotos,
        migrateVideos: !!val.migrateVideos,
        migrateComments: !!val.migrateComments,
        maxItems: val.maxItems && val.maxItems > 0 ? val.maxItems : null
      });
    });
  }
}

