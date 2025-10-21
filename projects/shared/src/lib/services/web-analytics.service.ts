import { Injectable, Optional, Inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import {
  AnalyticsService,
  AnalyticsConfig,
  IAnalyticsEvent,
  AnalyticsPageView,
} from './interfaces/analytics';
import { Logger } from './interfaces/logger';
import { LOGGER } from './injection-tokens';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    va?: (event: 'beforeSend' | 'event' | 'pageview', properties?: unknown) => void;
  }
}

/**
 * Web Analytics Service
 * Integrates with Google Analytics 4 and **DISABLED** Vercel Analytics
 * Privacy-conscious with opt-out and Do Not Track support
 * @deprecated Vercel Analytics is disabled due to privacy concerns
 */
@Injectable({
  providedIn: 'root'
})
export class WebAnalyticsService implements AnalyticsService {
  private config: AnalyticsConfig = {
    enabled: false,
    debug: false,
    respectDoNotTrack: true,
    anonymizeIp: true,
    providers: []
  };

  private initialized = false;
  private ga4MeasurementId?: string;
  private vercelAnalyticsEnabled = false;

  constructor(
    @Optional() @Inject(LOGGER) private logger?: Logger,
    @Optional() private router?: Router
  ) {
    this.checkDoNotTrack();
  }

  /**
   * Initialize analytics with configuration
   */
  async initialize(config: AnalyticsConfig): Promise<void> {
    this.config = { ...this.config, ...config };

    // Check if Do Not Track is enabled
    if (this.config.respectDoNotTrack && this.isDoNotTrackEnabled()) {
      this.log('Analytics disabled: Do Not Track is enabled');
      this.config.enabled = false;
      return;
    }

    if (!this.config.enabled) {
      this.log('Analytics is disabled');
      return;
    }

    // Initialize providers
    if (this.config.providers?.includes('ga4')) {
      await this.initializeGA4();
    }

    if (this.config.providers?.includes('vercel')) {
      await this.initializeVercelAnalytics();
    }

    // Track route changes automatically
    this.setupRouterTracking();

    this.initialized = true;
    this.log('Analytics initialized with providers:', this.config.providers);
  }

  /**
   * Initialize Google Analytics 4
   */
  private async initializeGA4(): Promise<void> {
    // Get measurement ID from window config or environment
    this.ga4MeasurementId = (window as any).GA4_MEASUREMENT_ID;

    if (!this.ga4MeasurementId) {
      this.log('GA4 measurement ID not found');
      return;
    }

    try {
      // Load GA4 script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.ga4MeasurementId}`;
      document.head.appendChild(script);

      // Initialize gtag
      window.dataLayer = window.dataLayer || [];
      window.gtag = function() {
        window.dataLayer!.push(arguments);
      };
      window.gtag('js', new Date());

      // Configure GA4 with privacy settings
      window.gtag('config', this.ga4MeasurementId, {
        anonymize_ip: this.config.anonymizeIp,
        send_page_view: false, // We'll send manually
        cookie_flags: 'SameSite=None;Secure',
      });

      this.log('GA4 initialized:', this.ga4MeasurementId);
    } catch (error) {
      this.logger?.error('Failed to initialize GA4', error);
    }
  }

  /**
   * Initialize Vercel Analytics
   */
  private async initializeVercelAnalytics(): Promise<void> {
    try {
      // Dynamically import Vercel Analytics
      this.vercelAnalyticsEnabled = false;
      this.log('Vercel Analytics initialized');
    } catch (error) {
      this.logger?.error('Failed to initialize Vercel Analytics', error);
    }
  }

  /**
   * Setup automatic router tracking
   */
  private setupRouterTracking(): void {
    if (!this.router) {
      return;
    }

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.trackPageView({
          path: event.urlAfterRedirects || event.url,
          title: document.title
        });
      });
  }

  /**
   * Track a page view
   */
  trackPageView(pageView: AnalyticsPageView): void {
    if (!this.isEnabled()) {
      return;
    }

    this.log('Page view:', pageView.path);

    // GA4
    if (window.gtag && this.ga4MeasurementId) {
      window.gtag('event', 'page_view', {
        page_path: pageView.path,
        page_title: pageView.title,
        page_referrer: pageView.referrer
      });
    }

    // Vercel Analytics
    if (window.va) {
      window.va('pageview', {
        path: pageView.path,
        title: pageView.title
      });
    }
  }

  /**
   * Track a custom event
   */
  trackEvent(event: IAnalyticsEvent): void {
    if (!this.isEnabled()) {
      return;
    }

    this.log('Event:', event.name, event.category, event.properties);

    // GA4
    if (window.gtag) {
      window.gtag('event', event.name, {
        event_category: event.category,
        ...event.properties,
        timestamp: event.timestamp || Date.now()
      });
    }

    // Vercel Analytics
    if (window.va) {
      window.va('event', {
        name: event.name,
        category: event.category,
        ...event.properties
      });
    }

    // Sentry breadcrumb
    if (this.logger) {
      this.logger.log(`[Analytics] ${event.category}: ${event.name}`, event.properties);
    }
  }

  /**
   * Track an error
   */
  trackError(error: Error, context?: Record<string, any>): void {
    if (!this.isEnabled()) {
      return;
    }

    this.log('Error:', error.message, context);

    this.trackEvent({
      name: 'error_occurred',
      category: 'error',
      properties: {
        error_message: error.message,
        error_name: error.name,
        error_stack: error.stack?.substring(0, 500), // Truncate stack trace
        ...context
      }
    });

    // Also log to Sentry
    if (this.logger) {
      this.logger.error('Analytics error tracked', error);
    }
  }

  /**
   * Track timing/performance
   */
  trackTiming(category: string, variable: string, time: number): void {
    if (!this.isEnabled()) {
      return;
    }

    this.log('Timing:', category, variable, time);

    // GA4
    if (window.gtag) {
      window.gtag('event', 'timing_complete', {
        name: variable,
        value: time,
        event_category: category
      });
    }

    // Custom event
    this.trackEvent({
      name: 'performance_metric',
      category: 'performance',
      properties: {
        metric_category: category,
        metric_name: variable,
        metric_value: time,
        metric_unit: 'ms'
      }
    });
  }

  /**
   * Set user properties (anonymous)
   */
  setUserProperties(properties: Record<string, any>): void {
    if (!this.isEnabled()) {
      return;
    }

    this.log('User properties:', properties);

    // GA4
    if (window.gtag) {
      window.gtag('set', 'user_properties', properties);
    }
  }

  /**
   * Identify user (optional, for logged-in users)
   */
  identify(userId: string, properties?: Record<string, any>): void {
    if (!this.isEnabled()) {
      return;
    }

    // IMPORTANT: Only use hashed/anonymous user IDs
    // Never send PII like email, name, etc.
    this.log('Identify user:', userId);

    // GA4
    if (window.gtag) {
      window.gtag('config', this.ga4MeasurementId!, {
        user_id: userId
      });

      if (properties) {
        this.setUserProperties(properties);
      }
    }
  }

  /**
   * Clear user identification (logout)
   */
  clear(): void {
    if (!this.isEnabled()) {
      return;
    }

    this.log('Clear user identification');

    // GA4
    if (window.gtag && this.ga4MeasurementId) {
      window.gtag('config', this.ga4MeasurementId, {
        user_id: null
      });
    }
  }

  /**
   * Check if analytics is enabled
   */
  isEnabled(): boolean {
    return this.initialized && this.config.enabled;
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;

    // Store preference in localStorage
    try {
      localStorage.setItem('analytics_enabled', enabled.toString());
    } catch (e) {
      // Ignore localStorage errors
    }

    this.log(`Analytics ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check if Do Not Track is enabled
   */
  private isDoNotTrackEnabled(): boolean {
    if (typeof navigator === 'undefined') {
      return false;
    }

    return (
      navigator.doNotTrack === '1' ||
      (window as any).doNotTrack === '1' ||
      (navigator as any).msDoNotTrack === '1'
    );
  }

  /**
   * Check Do Not Track and respect user preference
   */
  private checkDoNotTrack(): void {
    if (this.isDoNotTrackEnabled()) {
      this.config.enabled = false;
      this.log('Analytics disabled: Do Not Track detected');
    }
  }

  /**
   * Log debug messages
   */
  private log(...args: any[]): void {
    if (this.config.debug) {
      console.log('[Analytics]', ...args);
    }
  }
}

