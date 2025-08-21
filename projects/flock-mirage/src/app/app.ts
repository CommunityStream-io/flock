import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StepLayoutComponent } from 'shared';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, StepLayoutComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {
  title = 'flock-mirage';
}
