import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeToggleService } from '../theme/theme-toggle';

@Component({
  selector: 'shared-theme-toggle',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.css'
})
export class ThemeToggleComponent {
  private readonly themeService = inject(ThemeToggleService);
  
  readonly isDark = computed(() => this.themeService.currentTheme() === 'dark');

  toggleTheme(): void {
    console.log('🔧 BDD: Theme toggle clicked, switching to', this.isDark() ? 'light' : 'dark', 'theme');
    this.themeService.toggleTheme();
  }
}
