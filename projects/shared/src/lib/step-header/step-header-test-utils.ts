import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';

/**
 * Test utilities for StepHeader component testing
 * 
 * Provides reusable mock objects and test data for comprehensive testing
 * of the StepHeader component and its integration scenarios.
 */

export interface MockRouteData {
  title?: string | null;
  description?: string | null;
  next?: string;
  previous?: string;
}

export interface MockRouteSnapshot {
  title?: string | null;
  data?: MockRouteData | null;
}

/**
 * Creates a mock ActivatedRoute with configurable snapshot data
 */
export function createMockActivatedRoute(
  snapshot: MockRouteSnapshot = {},
  childRoute?: jasmine.SpyObj<ActivatedRoute>
): jasmine.SpyObj<ActivatedRoute> {
  const defaultSnapshot = {
    title: 'Default Test Title',
    data: { description: 'Default Test Description' }
  };

  return jasmine.createSpyObj('ActivatedRoute', [], {
    snapshot: { ...defaultSnapshot, ...snapshot },
    firstChild: childRoute ?? null
  });
}

/**
 * Creates a mock Router with configurable events
 */
export function createMockRouter(
  routerEventsSubject?: Subject<any>
): { router: jasmine.SpyObj<Router>; eventsSubject: Subject<any> } {
  const eventsSubject = routerEventsSubject ?? new Subject();
  
  const router = jasmine.createSpyObj('Router', ['navigate'], {
    events: eventsSubject.asObservable()
  });

  return { router, eventsSubject };
}

/**
 * Test data for different step routes matching the actual app configuration
 */
export const STEP_ROUTE_TEST_DATA = {
  upload: {
    title: 'Upload Data',
    data: { 
      description: 'Upload instagram archive',
      next: 'auth'
    }
  },
  auth: {
    title: 'Authenticate with Bluesky',
    data: {
      description: 'Authenticate with Bluesky to migrate',
      next: 'config',
      previous: 'upload'
    }
  },
  config: {
    title: 'Configuration',
    data: {
      description: 'Configure migration settings',
      next: 'migrate',
      previous: 'auth'
    }
  },
  migrate: {
    title: 'Migrate Data',
    data: {
      description: 'Start the migration process',
      next: 'complete',
      previous: 'config'
    }
  },
  complete: {
    title: 'Migration Complete',
    data: {
      description: 'Migration completed successfully',
      previous: 'migrate'
    }
  }
};

/**
 * Edge case test data for testing error handling and boundary conditions
 */
export const EDGE_CASE_TEST_DATA = {
  nullTitle: {
    title: null,
    data: { description: 'Valid Description' }
  },
  nullDescription: {
    title: 'Valid Title',
    data: { description: null }
  },
  nullData: {
    title: 'Valid Title',
    data: null
  },
  undefinedTitle: {
    title: undefined,
    data: { description: 'Valid Description' }
  },
  undefinedDescription: {
    title: 'Valid Title',
    data: { description: undefined }
  },
  undefinedData: {
    title: 'Valid Title',
    data: undefined
  },
  emptyTitle: {
    title: '',
    data: { description: 'Valid Description' }
  },
  emptyDescription: {
    title: 'Valid Title',
    data: { description: '' }
  },
  emptyDataObject: {
    title: 'Valid Title',
    data: {}
  },
  allNull: {
    title: null,
    data: null
  },
  allUndefined: {
    title: undefined,
    data: undefined
  },
  allEmpty: {
    title: '',
    data: { description: '' }
  }
};

/**
 * Creates a nested route structure for testing route traversal
 */
export function createNestedRouteStructure(
  levels: MockRouteSnapshot[]
): jasmine.SpyObj<ActivatedRoute> {
  if (levels.length === 0) {
    throw new Error('At least one level is required for nested route structure');
  }

  // Start with the deepest level (last in array)
  let currentRoute: jasmine.SpyObj<ActivatedRoute> | null = null;

  // Build from deepest to shallowest
  for (let i = levels.length - 1; i >= 0; i--) {
    const route = createMockActivatedRoute(levels[i], currentRoute ?? undefined);
    currentRoute = route;
  }

  return currentRoute!;
}