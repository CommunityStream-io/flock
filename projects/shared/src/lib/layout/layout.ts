import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HeaderComponent } from '../header/header';
import { StepNavigationComponent } from '../step-navigation/step-navigation';
import { StepControlsComponent } from '../step-controls/step-controls';
import { Router } from '@angular/router';

@Component({
  selector: 'shared-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSidenavModule, MatToolbarModule, MatIconModule, MatButtonModule, HeaderComponent, StepNavigationComponent, StepControlsComponent],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class LayoutComponent {
  private router = inject(Router);
  showStepUi = computed(() => {
    const url = this.router.url || '';
    return url.startsWith('/upload') || url.startsWith('/auth') || url.startsWith('/config') || url.startsWith('/execute') || url.startsWith('/complete');
  });
}
