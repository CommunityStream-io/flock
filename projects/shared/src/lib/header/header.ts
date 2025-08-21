import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle';
import { StartButton } from '../start-button/start-button';

@Component({
  selector: 'shared-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule, MatIconModule, ThemeToggleComponent, StartButton],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent {
  // Component logic will be added when services are implemented
}
