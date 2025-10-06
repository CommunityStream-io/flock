import { Observable } from "rxjs";
import { Type } from '@angular/core';

/**
 * Loads splash screen and adds message under loader
 */
export interface Loading { 
  /**
   * Indicates if the loading screen is visible
   */
  isLoading: Observable<boolean>;
  /**
   * The message to display under the loader
   */
  message: Observable<string>;
  /**
   * Optional component to render inside the splash screen
   */
  component: Observable<Type<unknown> | null>;
  /**
   * Shows the loading screen
   * - sets the message to the provided message
   */
  show(message: string): void;
  /**
   * Sets the component to render inside the splash screen
   */
  setComponent(component: Type<unknown> | null): void;
  /**
   * Hides the loading screen
   * - resets the message to the default message
   */
  hide(): void;
}