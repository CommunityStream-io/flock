import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * Support page component.
 * 
 * Displays information about supporting the Flock project and
 * includes a Ko-fi widget for donations.
 */
@Component({
  selector: 'shared-support',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule
  ],
  templateUrl: './support.html',
  styleUrl: './support.css'
})
export class Support {}

