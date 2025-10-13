import { InjectionToken } from '@angular/core';

/**
 * Injection tokens for shared services
 * These are separated to avoid circular dependencies
 */
export const BLUESKY = new InjectionToken('Bluesky');
export const CONFIG = new InjectionToken('Config');
export const FILE_PROCESSOR = new InjectionToken('FileProcessor');
export const INSTAGRAM = new InjectionToken('Instagram');
export const MIGRATION = new InjectionToken('Migration');
export const LOGGER = new InjectionToken('Logger');

