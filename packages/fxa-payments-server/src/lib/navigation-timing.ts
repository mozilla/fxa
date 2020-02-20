/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export const observeNavigationTiming = (beaconUrl: string) => {
  if (PerformanceObserver && navigator.sendBeacon) {
    const navTimingObs = new PerformanceObserver((entries, obs) => {
      const timings = JSON.stringify(entries.getEntries()[0]);
      const headers = { type: 'application/json' };
      const reqBlob = new Blob([timings], headers);
      navigator.sendBeacon(beaconUrl, reqBlob);
      obs.disconnect();
    });

    navTimingObs.observe({ entryTypes: ['navigation'] });
  }
};

export default observeNavigationTiming;
