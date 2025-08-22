import { Observable } from "rxjs";

/**
 * Loads splash screen and adds message under loader
 */
export interface Loading { 
  isLoading: Observable<boolean>;
  message: Observable<string>;
  show(message: string): void;
  hide(): void;
}