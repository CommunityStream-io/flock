import { Injectable } from '@angular/core';
import { Loading } from './interfaces';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SplashScreenLoading implements Loading {
  isLoading = new BehaviorSubject<boolean>(false);
  message = new BehaviorSubject<string>('*flap* *flap* *flap*');

  show(message: string) {
    this.message.next(message);
    this.isLoading.next(true);
  }

  hide() {
    this.isLoading.next(false);
  }
}

