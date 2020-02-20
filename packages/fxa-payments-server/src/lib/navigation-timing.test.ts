/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { observeNavigationTiming } from './navigation-timing';

it('sends navigation timing with sendBeacon', () => {
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
  window.navigator.sendBeacon = jest.fn();
  (window.PerformanceObserver as unknown) = mockPerformanceObserver;
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
