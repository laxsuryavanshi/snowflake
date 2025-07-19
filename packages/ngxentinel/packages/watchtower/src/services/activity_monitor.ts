import { DOCUMENT } from '@angular/common';
import { ApplicationRef, inject, Injectable, InjectionToken } from '@angular/core';
import {
  debounceTime,
  from,
  fromEvent,
  map,
  merge,
  Observable,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  timer,
} from 'rxjs';

/**
 * ActivityMonitorOptions defines the configuration for the ActivityMonitor service.
 */
export interface ActivityMonitorOptions {
  /**
   * Timeout duration in milliseconds before the monitor emits inactivity.
   *
   * @default 30 minutes (30 * 60 * 1000)
   */
  timeout?: number;

  /**
   * List of DOM events to monitor for user activity.
   *
   * @default ['click', 'keypress', 'mousemove', 'scroll', 'touchmove']
   */
  monitorEvents?: (keyof DocumentEventMap)[];

  /**
   * Debounce duration in milliseconds to limit how often activity is registered.
   *
   * @default 200
   */
  debounce?: number;

  /**
   * Initialization strategy. Can be a string (e.g., 'initializeWhenStable:30000') or a function
   * returning an Observable.
   *
   * @default 'initializeWhenStable:30000'
   */
  initStrategy?: string | (() => Observable<unknown>);
}

const DEFAULT_TIMEOUT = 30 * 60 * 1000; // 30 minutes

const DEFAULT_DEBOUNCE = 200; // 200 milliseconds

const DEFAULT_MONITOR_EVENTS: (keyof DocumentEventMap)[] = [
  'click',
  'keypress',
  'mousemove',
  'scroll',
  'touchmove',
];

const DEFAULT_INIT_STRATEGY = 'initializeWhenStable:30000';

/**
 * Injection token for providing ActivityMonitorOptions via Angular DI.
 *
 * Provides default values for timeout, debounce, monitorEvents, and initStrategy.
 */
export const ACTIVITY_MONITOR_OPTIONS = new InjectionToken<ActivityMonitorOptions>(
  'ACTIVITY_MONITOR_OPTIONS',
  {
    providedIn: 'root',
    factory: () => ({
      timeout: DEFAULT_TIMEOUT,
      debounce: DEFAULT_DEBOUNCE,
      monitorEvents: DEFAULT_MONITOR_EVENTS,
      initStrategy: DEFAULT_INIT_STRATEGY,
    }),
  }
);

/**
 * ActivityMonitor service observes user activity on the document and emits an event after a period
 * of inactivity.
 *
 * - Monitors specified DOM events (e.g., click, keypress) to detect activity.
 * - Debounces activity events to avoid excessive triggers.
 * - Emits on `timeout$` Observable after the configured period of inactivity.
 * - Can be reset programmatically via the `reset()` method.
 * - Initialization can be delayed or customized using the `initStrategy` option.
 *
 * @example
 *   constructor(activityMonitor: ActivityMonitor) {
 *     activityMonitor.timeout$.subscribe(() => {
 *       // Handle inactivity (e.g., logout user)
 *     });
 *   }
 */
@Injectable({ providedIn: 'root' })
export class ActivityMonitor {
  /**
   * Emits after the configured period of inactivity.
   * Subscribe to this Observable to react to user inactivity.
   */
  readonly timeout$: Observable<void>;
  private readonly reset$ = new Subject<void>();

  constructor() {
    const appRef = inject(ApplicationRef);
    const document = inject(DOCUMENT);

    const {
      timeout = DEFAULT_TIMEOUT,
      monitorEvents = DEFAULT_MONITOR_EVENTS,
      debounce = DEFAULT_DEBOUNCE,
      initStrategy = DEFAULT_INIT_STRATEGY,
    } = inject(ACTIVITY_MONITOR_OPTIONS);

    // Merge all specified DOM events into a single Observable
    const events$ = merge(...monitorEvents.map(event => fromEvent(document, event)));

    // Determine initialization strategy
    let init$: Observable<unknown>;
    if (typeof initStrategy === 'function') {
      init$ = initStrategy();
    } else {
      const [strategy, delay] = initStrategy.split(':');

      if (strategy !== 'initializeWhenStable') {
        throw new Error(`Unsupported ActivityMonitor initialization strategy: ${initStrategy}`);
      }

      const whenStable$ = from(appRef.whenStable());
      init$ = delay ? whenStable$ : merge(whenStable$, timer(+delay || 0));
    }

    const activity$ = merge(events$.pipe(startWith(null), debounceTime(debounce)), this.reset$);

    // Emits after inactivity timeout
    this.timeout$ = init$.pipe(
      switchMap(() => activity$),
      switchMap(() => timer(timeout + debounce)),
      map(() => void 0),
      shareReplay(1)
    );
  }

  /**
   * Manually resets the activity timer, postponing the inactivity event.
   */
  reset(): void {
    this.reset$.next();
  }
}
