import { Observable } from "rxjs";

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
   * Shows the loading screen
   * - sets the message to the provided message
   */
  show(message: string): void;
  /**
   * Hides the loading screen
   * - resets the message to the default message
   */
  hide(): void;
}