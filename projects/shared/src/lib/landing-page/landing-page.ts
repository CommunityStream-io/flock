import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { StartButton } from "../start-button/start-button";

/**
 * Landing page for information about how they can be a bird of a feather and flock together!
 *
 * This is the first page that the user sees when they visit the app.
 */
@Component({
  selector: 'shared-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, StartButton],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css'
})
export class LandingPage {}
