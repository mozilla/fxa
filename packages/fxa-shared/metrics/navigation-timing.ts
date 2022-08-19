/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * This is browser code to send Navigation Timing Level 2 (see
 * https://www.w3.org/TR/navigation-timing-2/) performance data.
 *
 * fetch _with keepalive_ or sendBeacon is used to send the data, with fetch
 * having a higher precedence.  At the time of writing, fetch in Firefox does
 * not support keepalive.
 */

const NAV_ENTRY_TYPE = 'navigation';

// export for testing
export const sendFn = () => {
  if (!!navigator.sendBeacon) {
    return (url: string, navTiming: PerformanceNavigationTiming) =>
      navigator.sendBeacon(
        url,
        new Blob([JSON.stringify(navTiming)], { type: 'application/json' })
      );
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
