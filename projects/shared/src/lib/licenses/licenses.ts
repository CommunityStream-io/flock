import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBluesky } from '@fortawesome/free-brands-svg-icons';
import { Butterfly } from '../butterfly/butterfly';

/**
 * Licenses and Attributions page component.
 * 
 * Displays credits for:
 * - Butterfly CSS animation by dazulu
 * - instagram-to-bluesky library by Marco Maroni
 * - Project license information
 * - Developer support options (Ko-fi)
 */
@Component({
  selector: 'shared-licenses',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule,
    MatDividerModule,
    FontAwesomeModule,
    Butterfly
  ],
  templateUrl: './licenses.html',
  styleUrl: './licenses.css'
})
export class Licenses {
  faBluesky = faBluesky;
}

