/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { NAVIGATION_TIMING_FIELDS } from './timing-fields';

/**
 * Small util for determining if a browser went to sleep.
 */
class SleepDetection {
  constructor() {
    this.sleepDetected = false;
    this.lastTime = Date.now();
    this.iid = '';
  }

  startSleepDetection() {
    this.iid = setInterval(() => {
      if (this.sleepDetected) {
        clearInterval(this.iid);
        return;
      }

      const currentTime = Date.now();
      if (currentTime > this.lastTime + 2000 * 2) {
        // ignore small delays
        this.sleepDetected = true;
      }
      this.lastTime = currentTime;
    }, 2000);
  }
}

/**
 * This minimal fallback api is deemed unreliable. We use this in
 * the event a browser doesn't provide a performance api. In these
 * cases there is not a monotonic clock for us to rely on, which can
 * result in weird edge cases where a system is put into a sleep state
 * and the metrics collected will be wildly off.
 */
class PerformanceFallback {
  constructor() {
    this.unreliable = true;
    this.timeOrigin = Date.now();
    this.timing = Object.create(NAVIGATION_TIMING_FIELDS);
    this.sleepDetection = new SleepDetection();
    this.sleepDetection.startSleepDetection();
  }

  now() {
    return Date.now() - this.timeOrigin;
  }

  // If the machine was put to sleep during metrics collection, the values
  // are invalid and cannot be used.
  isInSuspectState() {
    return this.sleepDetection.sleepDetected;
  }
}

/**
 * Provides a fake performance api with minimal functionality.
 */
export function getFallbackPerformanceApi() {
  return new PerformanceFallback();
}

/**
 * Provides the browser's performance api.
 */
export function getRealPerformanceApi() {
  // eslint-disable-next-line no-undef
  return window.performance;
}

/**
 * Provides a performance api, or for browsers that don't support the performance api, a version
 * of it to support minimal functionality required by speed trap.
 */
export function getPerformanceApi() {
  const api = getRealPerformanceApi();
  // If the api can produce a time origin and a valid now, let's use it.
  try {
    const check = api.timeOrigin + api.now();
    if (typeof check === 'number' && check > 0) {
      return api;
    }
  } catch (err) {}

  // Otherwise return the fallback api
  return getFallbackPerformanceApi();
}
