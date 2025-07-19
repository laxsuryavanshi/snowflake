import { DOCUMENT } from '@angular/common';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { ACTIVITY_MONITOR_OPTIONS, ActivityMonitor } from './activity_monitor';

describe('ActivityMonitor', () => {
  let document: Document;
  let monitor: ActivityMonitor;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        ActivityMonitor,
        {
          provide: ACTIVITY_MONITOR_OPTIONS,
          useValue: {
            timeout: 1000,
            debounce: 100,
            monitorEvents: ['click'],
            initStrategy: 'initializeWhenStable:0',
          },
        },
      ],
    });
    monitor = TestBed.inject(ActivityMonitor);
    document = TestBed.inject(DOCUMENT);
  }));

  it('should be created', () => {
    expect(monitor).toBeInstanceOf(ActivityMonitor);
  });

  it('should emit after timeout if no activity', fakeAsync(() => {
    let emitted = false;
    monitor.timeout$.subscribe(() => (emitted = true));
    tick(1200); // timeout + debounce
    expect(emitted).toBeTrue();
  }));

  it('should reset timer on activity', fakeAsync(() => {
    let emitted = false;
    monitor.timeout$.subscribe(() => (emitted = true));
    tick(900);
    document.dispatchEvent(new Event('click'));
    tick(900);
    expect(emitted).toBeFalse();
    tick(300);
    expect(emitted).toBeTrue();
  }));

  it('should reset timer when reset() is called', fakeAsync(() => {
    let emitted = false;
    monitor.timeout$.subscribe(() => (emitted = true));
    tick(900);
    monitor.reset();
    tick(900);
    expect(emitted).toBeFalse();
    tick(300);
    expect(emitted).toBeTrue();
  }));
});
