import { Injectable, Type } from '@angular/core';
import { Loading } from './interfaces';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SplashScreenLoading implements Loading {
  isLoading = new BehaviorSubject<boolean>(false);
  private defaultMessage = '*flap* *flap* *flap*';
  message = new BehaviorSubject<string>(this.defaultMessage);
  component = new BehaviorSubject<Type<unknown> | null>(null);

  show(message: string) {
    this.message.next(message);
    this.isLoading.next(true);
  }

  hide() {
    this.isLoading.next(false);
    this.message.next(this.defaultMessage);
    this.component.next(null);
  }

  setComponent(component: Type<unknown> | null): void {
    this.component.next(component);
  }
}

