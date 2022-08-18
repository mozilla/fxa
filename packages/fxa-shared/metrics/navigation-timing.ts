/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as sentry from '@sentry/browser';
import { InvalidNavigationTimingError } from './metric-errors';

/**
 * This is browser code to send Navigation Timing Level 2 (see
 * https://www.w3.org/TR/navigation-timing-2/) performance data.
 *
 * fetch _with keepalive_ or sendBeacon is used to send the data, with fetch
 * having a higher precedence.  At the time of writing, fetch in Firefox does
 * not support keepalive.
 */

const NAV_ENTRY_TYPE = 'navigation';

export const checkNavTiming = (navTimings: any) => {
  const errors = [];
  function check(key: string, min?: number, rel?: string) {
    if (navTimings[key] == null) {
      errors.push(
        new InvalidNavigationTimingError(
          `navTiming.${key}`,
          'missing',
          navTimings[key],
          0
        )
      );
    } else if (min != null && navTimings[key] < min) {
      errors.push(
        new InvalidNavigationTimingError(
          `navTiming.${key}`,
          'less than 0',
          navTimings[key],
          0
        )
      );
    } else if (rel && navTimings[key] < navTimings[rel]) {
      errors.push(
        new InvalidNavigationTimingError(
          `navTiming.${key}`,
          `less than ${rel}`,
          navTimings[key],
          navTimings[rel]
        )
      );
    }
  }

  check('domainLookupStart', Number.MAX_SAFE_INTEGER);
  check('requestStart', 0, 'domainLookupStart');
  check('responseStart', 0, 'requestStart');
  check('responseEnd', 0, 'responseStart');
  check('domInteractive', 0, 'responseEnd');
  check('domComplete', 0, 'domInteractive');
  check('loadEventStart', 0, 'domComplete');
  check('loadEventEnd', 0, 'loadEventStart');
  check('redirectStart');

  // Name must be a valid url, and ideally it matches the window.document.URL
  try {
    new URL(navTimings.name);
  } catch (err) {
    errors.push(
      new InvalidNavigationTimingError(
        'navTiming.name',
        'invalid value',
        navTimings.name,
        window.document.URL
      )
    );
  }

  return errors;
};

// export for testing
export const sendFn = () => {
  if (!!navigator.sendBeacon) {
    return (url: string, navTiming: PerformanceNavigationTiming) => {
      // Raise errors for bad states
      const errors = checkNavTiming(navTiming);

      // Short circuit and capture errors, don't report bad data.
      if (errors.length > 0) {
        for (const error of errors) {
          sentry.captureException(error);
        }
        return;
      }

      return navigator.sendBeacon(
        url,
        new Blob([JSON.stringify(navTiming)], { type: 'application/json' })
      );
    };
  }

  // noop if no avaiable API to send
  return () => {};
};
const defaultSendFn = sendFn();

export const observeNavigationTiming = (
  url: string,
  send: ReturnType<typeof sendFn> = defaultSendFn
) => {
  // TS4 wants to mark this as a bug saying it's always true
  // but in the unit tests under jsdom it isn't
  // @ts-ignore
  if (performance.getEntriesByType && PerformanceObserver && !!send) {
    // By the time this is called, the event might've completed.  Use the
    // PerformanceObserver API if it hasn't, otherwise send the data.
    const navTiming = performance.getEntriesByType(
      NAV_ENTRY_TYPE
    )[0] as PerformanceNavigationTiming;

    // Once duration is recorded the event is over
    if (navTiming && navTiming.duration > 0) {
      send(url, navTiming);
    } else {
      const navTimingObs = new PerformanceObserver((entries, obs) => {
        send(url, entries.getEntries()[0] as PerformanceNavigationTiming);
        obs.disconnect();
      });

      navTimingObs.observe({ entryTypes: [NAV_ENTRY_TYPE] });
    }
  }
};

export default observeNavigationTiming;
