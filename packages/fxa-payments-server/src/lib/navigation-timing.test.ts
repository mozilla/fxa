/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { observeNavigationTiming } from './navigation-timing';

type MockEntryList = { getEntries: () => [object] };
type ObsCallback = (_entries: MockEntryList, _obs: object) => undefined;
let cb = (_entries: MockEntryList, _obs: object) => {};
const observeFn = jest.fn();
const disconnectFn = jest.fn();
const getEntries = jest.fn().mockReturnValue([{ foo: 'bar' }]);
const mockObs = { observe: observeFn, disconnect: disconnectFn };
const mockPerformanceObserver = function(callback: ObsCallback) {
  cb = callback;
  return mockObs;
};
const mockGetEntriesByType = (perfEntries: PerformanceEntry[]) =>
  (window.performance.getEntriesByType = jest
    .fn()
    .mockReturnValue(perfEntries));
window.navigator.sendBeacon = jest.fn();
(window.PerformanceObserver as unknown) = mockPerformanceObserver;

// "queue" below is referring to
// https://www.w3.org/TR/performance-timeline-2/#queue-a-performanceentry

describe('lib/navigation-timing', () => {
  beforeEach(() => {
    (<jest.Mock>window.navigator.sendBeacon).mockClear();
  });
  describe('executes before PerformanceNavigationTiming object is queued', () => {
    it('uses PerformanceObserver', () => {
      mockGetEntriesByType([{ duration: 0 } as PerformanceEntry]);
      observeNavigationTiming('/x/y/z');
      cb({ getEntries }, mockObs);
      expect(observeFn).toHaveBeenCalledWith({ entryTypes: ['navigation'] });
      expect(window.navigator.sendBeacon).toHaveBeenCalledTimes(1);
      const expectedBlob = new Blob([JSON.stringify({ foo: 'bar' })], {
        type: 'application/json',
      });
      expect(window.navigator.sendBeacon).toHaveBeenCalledWith(
        '/x/y/z',
        expectedBlob
      );
      expect(disconnectFn).toBeCalledTimes(1);
    });
  });
  describe('executes after PerformanceNavigationTiming has queued', () => {
    it('sends performance metrics from peformance.getEntriesByType', () => {
      const navTiming = { duration: 1289 };
      mockGetEntriesByType([navTiming as PerformanceEntry]);
      observeNavigationTiming('/x/y/z');
      expect(window.navigator.sendBeacon).toHaveBeenCalledTimes(1);
      const expectedBlob = new Blob([JSON.stringify(navTiming)], {
        type: 'application/json',
      });
      expect(window.navigator.sendBeacon).toHaveBeenCalledWith(
        '/x/y/z',
        expectedBlob
      );
    });
  });
});
