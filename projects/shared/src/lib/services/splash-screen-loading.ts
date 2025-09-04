import { Injectable } from '@angular/core';
import { Loading } from './interfaces';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SplashScreenLoading implements Loading {
  isLoading = new BehaviorSubject<boolean>(false);
  private defaultMessage = '*flap* *flap* *flap*';
  message = new BehaviorSubject<string>(this.defaultMessage);

  show(message: string) {
    this.message.next(message);
    this.isLoading.next(true);
  }

  hide() {
    this.isLoading.next(false);
    this.message.next(this.defaultMessage);
  }
}

