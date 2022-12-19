/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 /**
  * Navigation Timing fields we use for metrics.
  */
export const NAVIGATION_TIMING_FIELDS = {
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

export const OPTIONAL_NAVIGATION_TIMING_FIELDS = [
  'loadEventEnd',
  'loadEventStart',
  'redirectEnd',
  'redirectStart',
  'secureConnectionStart',
  'unloadEventEnd',
  'unloadEventStart'
];
