import { Injectable, Type, inject } from '@angular/core';
import { Loading, Logger } from './interfaces';
import { BehaviorSubject } from 'rxjs';
import { LOGGER } from '.';

@Injectable({
  providedIn: 'root'
})
export class SplashScreenLoading implements Loading {
  private logger = inject<Logger>(LOGGER);
  
  isLoading = new BehaviorSubject<boolean>(false);
  private defaultMessage = '*flap* *flap* *flap*';
  message = new BehaviorSubject<string>(this.defaultMessage);
  component = new BehaviorSubject<Type<unknown> | null>(null);

  show(message: string) {
    this.log('show() called with message:', message);
    this.message.next(message);
    this.isLoading.next(true);
  }

  hide() {
    this.log('hide() called');
    this.isLoading.next(false);
    this.message.next(this.defaultMessage);
    this.component.next(null);
  }

  setComponent(component: Type<unknown> | null): void {
    const componentName = component ? component.name : 'null';
    const currentComponent = this.component.getValue();
    const currentComponentName = currentComponent ? currentComponent.name : 'null';
    
    // Capture stack trace to see who's calling this
    const stack = new Error().stack;
    const callerLine = stack?.split('\n')[2]?.trim() || 'unknown caller';
    
    this.log(`setComponent() called: ${currentComponentName} → ${componentName}`);
    this.log('Called from:', callerLine);
    
    // Log full stack trace if we're resetting a component
    if (component === null && currentComponent !== null) {
      this.log('⚠️ Component being reset! Full stack trace:');
      stack?.split('\n').slice(1, 6).forEach(line => {
        this.log('  ', line.trim());
      });
    }
    
    this.component.next(component);
  }

  /**
   * Logging helper with service prefix
   */
  private log(...args: any[]): void {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    this.logger.log(`[SplashScreenLoading] ${message}`);
  }
}

