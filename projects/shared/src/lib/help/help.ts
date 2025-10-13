import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';

/**
 * Help page component.
 * 
 * Provides comprehensive guidance for users on:
 * - Exporting their Instagram data
 * - Understanding the email confirmation process
 * - Setting up Bluesky app passwords (security best practice)
 * - Understanding rate limiting during migration
 */
@Component({
  selector: 'shared-help',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule,
    MatExpansionModule
  ],
  templateUrl: './help.html',
  styleUrl: './help.css'
})
export class Help {}

