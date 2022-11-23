/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const NAVIGATION_TIMING_FIELDS = {
  navigationStart: undefined,
  unloadEventStart: undefined,
  unloadEventEnd: undefined,
  redirectStart: undefined,
  redirectEnd: undefined,
  fetchStart: undefined,
  domainLookupStart: undefined,
  domainLookupEnd: undefined,
  connectStart: undefined,
  connectEnd: undefined,
  secureConnectionStart: undefined,
  requestStart: undefined,
  responseStart: undefined,
  responseEnd: undefined,
  domLoading: undefined,
  domInteractive: undefined,
  domContentLoadedEventStart: undefined,
  domContentLoadedEventEnd: undefined,
  domComplete: undefined,
  loadEventStart: undefined,
  loadEventEnd: undefined,
};

var navigationTiming;
try {
  // eslint-disable-next-line no-undef
  navigationTiming = window.performance.timing;
} catch (e) {
  // NOOP
}

if (!navigationTiming) {
  navigationTiming = Object.create(NAVIGATION_TIMING_FIELDS);
}

var navigationStart = navigationTiming.navigationStart || Date.now();

class NavigationTiming {
  init(options) {
    options = options || {};
    this.navigationTiming = options.navigationTiming || navigationTiming;
    this.baseTime = navigationStart;
  }

  get() {
    return this.navigationTiming;
  }

  diff() {
    var diff = {};
    var baseTime = this.baseTime;

    for (var key in NAVIGATION_TIMING_FIELDS) {
      var timing = this.navigationTiming[key];

      if (timing >= baseTime) {
        diff[key] = timing - baseTime;
      } else {
        diff[key] = null;
      }
    }
    return diff;
  }
}

export default new NavigationTiming();
