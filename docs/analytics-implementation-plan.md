# Analytics Implementation Plan for Flock Native & Flock Murmur

## 🎯 Executive Summary

This plan outlines the implementation of comprehensive analytics across the Flock ecosystem, leveraging Sentry's analytics capabilities alongside error tracking. The solution provides a unified analytics interface in the shared library with platform-specific implementations for flock-native (Electron) and flock-murmur (Vercel/Web).

**Key Reference**: [Sentry Analytics Documentation](https://develop.sentry.dev/development-infrastructure/analytics/)

## 📋 Overview

### Current State
- ✅ Sentry error tracking implemented in shared library (`SentryLogger`)
- ✅ Electron main process has `SentryManager`
- ✅ Basic logging infrastructure in place
- ❌ No structured analytics or user behavior tracking
- ❌ No performance transaction monitoring
- ❌ No custom event tracking

### Proposed State
- ✅ Unified `AnalyticsService` interface in shared library
- ✅ Platform-agnostic analytics implementation
- ✅ Custom event tracking for user workflows
- ✅ Performance transaction monitoring
- ✅ Privacy-compliant data collection
- ✅ Multi-platform support (Electron, Web, Vercel)

## 🏗️ Architecture

### Shared Analytics Interface

The core analytics interface will extend the existing logging infrastructure:

```typescript
export interface AnalyticsService {
  // Initialization
  instrument(appName: string, config?: AnalyticsConfig): Promise<void>;
  
  // Event tracking
  trackEvent(eventName: string, properties?: Record<string, any>): void;
  
  // Performance monitoring
  startTransaction(name: string, context?: TransactionContext): Transaction | null;
  
  // User context
  setUser(userId: string, properties?: Record<string, any>): void;
  
  // Custom context
  setContext(contextName: string, data: Record<string, any>): void;
  
  // Page/route tracking
  trackPageView(routeName: string, properties?: Record<string, any>): void;
}
```

### Platform-Specific Implementations

#### Flock Native (Electron)
- **Renderer Process**: Angular-based analytics using `@sentry/angular`
- **Main Process**: Node.js analytics using `@sentry/electron`
- **IPC Analytics**: Track inter-process communication performance
- **File Operations**: Track native file processing metrics
- **Offline Support**: Queue events when offline

#### Flock Murmur (Vercel/Web)
- **Browser Analytics**: Web-based analytics using `@sentry/browser`
- **Router Integration**: Automatic page view tracking
- **Web Vitals**: Core Web Vitals integration (LCP, FID, CLS)
- **Vercel Integration**: Optional Vercel Analytics integration
- **Session Tracking**: Track user sessions across page loads

## 📊 Event Taxonomy

### User Workflow Events
Track user progress through migration:

| Event Name | Properties | Purpose |
|------------|-----------|---------|
| `step_started` | `step_name`, `step_index`, `total_steps` | Track step entry |
| `step_completed` | `step_name`, `duration_ms`, `data` | Track step completion |
| `step_abandoned` | `step_name`, `reason` | Track drop-off points |
| `migration_started` | `total_posts`, `total_media` | Track migration initiation |
| `migration_completed` | `posts_migrated`, `duration_min`, `success_rate` | Track successful migrations |

### Feature Usage Events
Track feature adoption:

| Event Name | Properties | Purpose |
|------------|-----------|---------|
| `feature_used` | `feature_name`, `feature_value` | Track feature interactions |
| `archive_validated` | `archive_size_mb`, `validation_result` | Track archive processing |
| `migration_configured` | `media_mode`, `post_limit`, `settings` | Track configuration choices |

### Performance Transactions
Monitor performance:

| Transaction Name | Operation | Purpose |
|-----------------|-----------|---------|
| `migration_workflow` | `workflow` | End-to-end migration timing |
| `archive_extraction` | `file_processing` | Archive extraction performance |
| `auth_workflow` | `authentication` | Authentication flow timing |
| `config_submission` | `user_action` | Configuration form performance |

## 🚀 Implementation Phases

### Phase 1: Foundation (Week 1-2)

**Deliverables**:
- [ ] `AnalyticsService` interface in shared library
- [ ] `SentryAnalytics` base implementation
- [ ] Event type definitions and constants
- [ ] Analytics injection token (`ANALYTICS`)
- [ ] Unit tests for analytics service

**Files**:
- `projects/shared/src/lib/services/interfaces/analytics.ts` (new)
- `projects/shared/src/lib/services/sentry-analytics.ts` (new)
- `projects/shared/src/lib/services/index.ts` (update)

### Phase 2: Flock Native Integration (Week 2-3)

**Deliverables**:
- [ ] `NativeAnalytics` service extending `SentryAnalytics`
- [ ] Main process `AnalyticsManager`
- [ ] IPC operation tracking
- [ ] Component integration (upload, config, execute steps)
- [ ] Electron-specific context (platform, version, is_packaged)

**Files**:
- `projects/flock-native/src/app/service/native-analytics.ts` (new)
- `projects/flock-native/electron/analytics-manager.js` (new)
- `projects/flock-native/src/app/app.config.ts` (update)

**Integration Points**:
- Upload step: Track file selection and validation
- Auth step: Track authentication flow
- Config step: Track configuration choices
- Execute step: Track migration progress
- IPC handlers: Track file operations and CLI calls

### Phase 3: Flock Murmur Integration (Week 3-4)

**Deliverables**:
- [ ] `WebAnalytics` service extending `SentryAnalytics`
- [ ] Router integration for page tracking
- [ ] Web Vitals integration
- [ ] Optional Vercel Analytics integration
- [ ] Component integration (same as Native)

**Files**:
- `projects/flock-murmur/src/app/service/web-analytics.ts` (new)
- `projects/flock-murmur/src/app/app.config.ts` (update)

**Integration Points**:
- Same component integration as flock-native
- Router-based page view tracking
- Web performance monitoring
- Browser-specific context

### Phase 4: UI & Privacy (Week 4-5)

**Deliverables**:
- [ ] Privacy settings component (shared)
- [ ] Analytics consent toggle
- [ ] Analytics status indicator (dev mode)
- [ ] Documentation and developer guide
- [ ] Sentry dashboard setup

**Files**:
- `projects/shared/src/lib/components/privacy-settings/` (new)
- `projects/shared/src/lib/components/analytics-status/` (new)
- `docs/architecture/shared/ANALYTICS.md` ✅ (created)

## 🎨 UI Components

### Privacy Settings Component

Shared component for analytics preferences:

```typescript
@Component({
  selector: 'app-privacy-settings',
  template: `
    <mat-slide-toggle [(ngModel)]="analyticsEnabled" (change)="onAnalyticsToggle()">
      Share anonymous usage analytics
    </mat-slide-toggle>
    <p class="privacy-note">
      Help us improve by sharing anonymous usage data. 
      No personal information is collected.
    </p>
  `
})
export class PrivacySettingsComponent {
  analyticsEnabled = true;
  
  constructor(@Inject(ANALYTICS) private analytics: AnalyticsService) {}
  
  onAnalyticsToggle() {
    if (this.analyticsEnabled) {
      this.analytics.enable();
    } else {
      this.analytics.disable();
    }
  }
}
```

### Analytics Status Indicator

Development-only component to show analytics status:

```typescript
@Component({
  selector: 'app-analytics-status',
  template: `
    <div class="analytics-status" *ngIf="!production">
      <mat-icon>analytics</mat-icon>
      <span>Analytics: {{ status }}</span>
    </div>
  `
})
export class AnalyticsStatusComponent implements OnInit {
  status = 'initializing';
  production = environment.production;
  
  constructor(@Inject(ANALYTICS) private analytics: AnalyticsService) {}
  
  async ngOnInit() {
    this.status = await this.analytics.getStatus();
  }
}
```

## 🔒 Privacy & Compliance

### Data Collection Guidelines

**✅ DO Collect**:
- Anonymous usage patterns
- Feature adoption rates
- Performance metrics
- Error types and frequencies
- Platform/browser information

**❌ DO NOT Collect**:
- Bluesky usernames or handles
- Instagram post content
- Personal information (emails, names)
- File paths or directory structures
- Authentication tokens or credentials

### Implementation Safeguards

All events are sanitized before sending:

```typescript
private sanitizeProperties(props?: Record<string, any>): Record<string, any> {
  if (!props) return {};
  
  const sanitized = { ...props };
  
  // Remove sensitive keys
  const sensitiveKeys = ['username', 'password', 'token', 'email', 'filepath'];
  sensitiveKeys.forEach(key => {
    delete sanitized[key];
    // Also check nested objects
    Object.keys(sanitized).forEach(k => {
      if (typeof sanitized[k] === 'object' && sanitized[k] !== null) {
        delete sanitized[k][key];
      }
    });
  });
  
  return sanitized;
}
```

## 📈 Success Metrics

### Technical Metrics
- ✅ Analytics service available in all applications
- ✅ <100ms overhead for event tracking
- ✅ <1% analytics error rate
- ✅ 100% event sanitization coverage
- ✅ Graceful degradation when analytics unavailable

### Business Metrics
- ✅ Track 100% of user workflow steps
- ✅ Capture all critical conversion events
- ✅ Monitor all performance transactions
- ✅ 90%+ event delivery rate
- ✅ Privacy compliance for all tracked data

### Key Metrics to Track

| Metric | Purpose |
|--------|---------|
| **Migration Completion Rate** | % of users who finish migration |
| **Step Abandonment Rate** | Identify drop-off points |
| **Average Migration Time** | Performance benchmarking |
| **Error Rate by Step** | Identify problematic areas |
| **Feature Adoption** | Track feature usage |
| **Platform Distribution** | Optimize for popular platforms |

## 🔧 Technical Considerations

### Flock Native Specific

**Challenges**:
- Two-process architecture (main + renderer)
- Offline operation support
- Native file system operations
- IPC performance overhead

**Solutions**:
- Main process analytics manager
- Event queueing for offline mode
- Performance transaction tracking
- IPC operation monitoring

### Flock Murmur Specific

**Challenges**:
- Browser limitations
- Vercel serverless environment
- Session tracking across reloads
- Web performance variability

**Solutions**:
- Web Vitals integration
- Optional Vercel Analytics
- Browser context tracking
- Progressive enhancement

### Shared Library Considerations

**Challenge**: Different platforms have different analytics needs

**Solution**: 
- Abstract interface in shared library
- Platform-specific implementations
- Graceful degradation
- Type-safe event definitions

## 📚 Resources

### Documentation
- ✅ [Analytics Architecture](../docs/architecture/shared/ANALYTICS.md) - Comprehensive technical documentation
- 📖 [Sentry Analytics](https://develop.sentry.dev/development-infrastructure/analytics/) - Official Sentry analytics guide
- 📖 [Angular Analytics Patterns](https://angular.io/guide/observables) - Angular best practices
- 📖 [Electron Analytics](https://www.electronjs.org/docs/latest/tutorial/performance) - Electron performance monitoring

### Sentry Setup
- 📊 Create custom Sentry dashboards for analytics
- 🔍 Set up alerts for performance regressions
- 📈 Configure transaction sampling rates
- 🎯 Define custom metrics and KPIs

## 🎯 Next Steps

1. **Review & Approve** this plan
2. **Setup Sentry Projects** for analytics (if separate from error tracking)
3. **Create GitHub Project** to track implementation
4. **Phase 1 Kickoff** - Start with shared analytics interface
5. **Iterative Development** - Follow phases 1-4
6. **Testing & Validation** - Verify analytics in development
7. **Production Rollout** - Enable in production with monitoring

## 💡 Questions to Resolve

- [ ] Should we use separate Sentry projects for analytics vs error tracking?
- [ ] What are the Vercel Analytics requirements/preferences?
- [ ] Should analytics be opt-in or opt-out?
- [ ] What sampling rate should we use in production?
- [ ] Do we need analytics in flock-mirage (MVP), or just Native and Murmur?

---

**Full Technical Documentation**: See [docs/architecture/shared/ANALYTICS.md](../docs/architecture/shared/ANALYTICS.md) for complete implementation details, code examples, and integration patterns.
