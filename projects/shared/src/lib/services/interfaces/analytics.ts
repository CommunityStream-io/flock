/**
 * Analytics Service Interface
 * Privacy-conscious event tracking for user behavior and application metrics
 */

export interface AnalyticsEvent {
  name: string;
  category: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

export interface AnalyticsPageView {
  path: string;
  title?: string;
  referrer?: string;
}

export interface AnalyticsUser {
  id?: string;
  properties?: Record<string, any>;
}

export interface AnalyticsConfig {
  enabled: boolean;
  debug?: boolean;
  respectDoNotTrack?: boolean;
  anonymizeIp?: boolean;
  providers?: string[];
}

/**
 * Analytics Service for tracking user behavior and application metrics
 * 
 * Privacy-first approach:
 * - No PII (Personally Identifiable Information) by default
 * - Respects Do Not Track browser setting
 * - Anonymous tracking only
 * - User can opt-out anytime
 */
export interface AnalyticsService {
  /**
   * Initialize analytics with configuration
   */
  initialize(config: AnalyticsConfig): Promise<void>;

  /**
   * Track a page view
   */
  trackPageView(pageView: AnalyticsPageView): void;

  /**
   * Track a custom event
   */
  trackEvent(event: AnalyticsEvent): void;

  /**
   * Track an error
   */
  trackError(error: Error, context?: Record<string, any>): void;

  /**
   * Track timing/performance
   */
  trackTiming(category: string, variable: string, time: number): void;

  /**
   * Set user properties (anonymous)
   */
  setUserProperties(properties: Record<string, any>): void;

  /**
   * Identify user (optional, for logged-in users)
   */
  identify(userId: string, properties?: Record<string, any>): void;

  /**
   * Clear user identification (logout)
   */
  clear(): void;

  /**
   * Check if analytics is enabled
   */
  isEnabled(): boolean;

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean): void;
}

/**
 * Common analytics event categories
 */
export const AnalyticsCategory = {
  // Navigation
  NAVIGATION: 'navigation',
  
  // User actions
  USER_ACTION: 'user_action',
  
  // Migration workflow
  MIGRATION: 'migration',
  FILE_UPLOAD: 'file_upload',
  AUTHENTICATION: 'authentication',
  CONFIGURATION: 'configuration',
  
  // System
  ERROR: 'error',
  PERFORMANCE: 'performance',
  
  // UI
  UI_INTERACTION: 'ui_interaction',
  THEME: 'theme',
} as const;

/**
 * Common analytics event names
 */
export const AnalyticsEvent = {
  // Page views
  PAGE_VIEW: 'page_view',
  
  // Navigation
  NAVIGATE_TO: 'navigate_to',
  NAVIGATE_BACK: 'navigate_back',
  NAVIGATE_NEXT: 'navigate_next',
  
  // File operations
  FILE_SELECTED: 'file_selected',
  FILE_VALIDATED: 'file_validated',
  FILE_UPLOAD_STARTED: 'file_upload_started',
  FILE_UPLOAD_SUCCESS: 'file_upload_success',
  FILE_UPLOAD_FAILED: 'file_upload_failed',
  
  // Authentication
  AUTH_STARTED: 'auth_started',
  AUTH_SUCCESS: 'auth_success',
  AUTH_FAILED: 'auth_failed',
  
  // Configuration
  CONFIG_UPDATED: 'config_updated',
  DATE_RANGE_CHANGED: 'date_range_changed',
  SETTINGS_CHANGED: 'settings_changed',
  
  // Migration
  MIGRATION_STARTED: 'migration_started',
  MIGRATION_COMPLETED: 'migration_completed',
  MIGRATION_FAILED: 'migration_failed',
  MIGRATION_CANCELLED: 'migration_cancelled',
  
  // UI interactions
  BUTTON_CLICKED: 'button_clicked',
  LINK_CLICKED: 'link_clicked',
  THEME_CHANGED: 'theme_changed',
  HELP_VIEWED: 'help_viewed',
  
  // Errors
  ERROR_OCCURRED: 'error_occurred',
  ERROR_BOUNDARY_HIT: 'error_boundary_hit',
  
  // Performance
  PERFORMANCE_METRIC: 'performance_metric',
  SLOW_OPERATION: 'slow_operation',
} as const;

