import { Component, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'shared-start-button',
  imports: [MatButton, MatIcon, RouterModule],
  templateUrl: './start-button.html',
  styleUrl: './start-button.css'
})
export class StartButton {
  icon = input('upload');
  label = input('Start Migration');
}