import { Component } from '@angular/core';
import { LayoutComponent, RouterSplash } from 'shared';

@Component({
  selector: 'app-root',
  imports: [LayoutComponent, RouterSplash],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
}
