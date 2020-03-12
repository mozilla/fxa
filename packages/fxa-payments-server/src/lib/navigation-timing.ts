/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export const observeNavigationTiming = (beaconUrl: string) => {
  if (
    performance.getEntriesByType &&
    PerformanceObserver &&
    navigator.sendBeacon
  ) {
    // By the time this is called, the event might've completed.  Use the
    // PerformanceObserver API if it hasn't, otherwise send the data.
    const NAV_ENTRY_TYPE = 'navigation';
    const navTiming = performance.getEntriesByType(
      NAV_ENTRY_TYPE
    )[0] as PerformanceNavigationTiming;

    // Once duration is recorded the event is over
    if (navTiming.duration > 0) {
      navigator.sendBeacon(beaconUrl, JSON.stringify(navTiming));
    } else {
      const navTimingObs = new PerformanceObserver((entries, obs) => {
        navigator.sendBeacon(
          beaconUrl,
          JSON.stringify(entries.getEntries()[0])
        );
        obs.disconnect();
      });

      navTimingObs.observe({ entryTypes: [NAV_ENTRY_TYPE] });
    }
  }
};

export default observeNavigationTiming;
