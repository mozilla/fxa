/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import NAVIGATION_TIMING_FIELDS from './navigation-timing';

class NavigationTiming {
  init(opts) {

    // A performance api must be provided
    if (!opts || !opts.performance) {
      throw new Error('opts.performance is required!')
    }


    this.performance = opts.performance;

    // TODO: Upgrade to performance api v2
    this.navigationTiming = opts.performance.timing;
  }

  get() {
    return this.navigationTiming;
  }

  diff() {
    const diff = {};
    const baseTime = this.performance.timeOrigin;

    if (this.performance.unreliable === true) {
      for (const key in NAVIGATION_TIMING_FIELDS) {
        diff[key] = null;
      }

      return diff;
    }
    else {
      for (const key in NAVIGATION_TIMING_FIELDS) {
        const timing = this.navigationTiming[key];
        const delta = timing - baseTime;

        if (timing === 0) {
          // A time value of 0 for certain fields indicates a non-applicable value. Set to null.
          diff[key] = null;
        }
        else if (delta < 0) {
          // We shouldn't see any negative values. If we do something went super wrong.
          // We will set the value to -1 to ensure a sentry error is captured.
          diff[key] = -1;
        }
      }
      return diff;
    }
  }
}

export default new NavigationTiming();
