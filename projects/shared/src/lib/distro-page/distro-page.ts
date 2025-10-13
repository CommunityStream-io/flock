import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PlatformService } from '../services/platform.service';

@Component({
  selector: 'shared-distro-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './distro-page.html',
  styleUrl: './distro-page.css'
})
export class DistroPage {
  private readonly platform = inject(PlatformService);

  readonly ctaLabel = computed(() => this.platform.getPrimaryCtaLabel());
  readonly latestReleaseUrl = 'https://github.com/CommunityStream-io/flock/releases/latest';
}
