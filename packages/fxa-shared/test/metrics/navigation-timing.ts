/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sinon from 'sinon';
import { observeNavigationTiming } from '../../metrics/navigation-timing';

type MockEntryList = { getEntries: () => [object] };
type ObsCallback = (_entries: MockEntryList, _obs: object) => undefined;
let cb = (_entries: MockEntryList, _obs: object) => {};

const sandbox = sinon.createSandbox();
const sendFn = sandbox.stub();
const observeFn = sandbox.stub();
const disconnectFn = sandbox.stub();
const getEntries = sandbox.stub().returns([{ foo: 'bar' }]);
const mockObs = { observe: observeFn, disconnect: disconnectFn };
const mockPerformanceObserver = function (callback: ObsCallback) {
  cb = callback;
  return mockObs;
};
const mockGetEntriesByType = (perfEntries: PerformanceEntry[]) => {
  (global.performance as unknown) = {
    getEntriesByType: sandbox.stub().returns(perfEntries),
  };
};
(global.PerformanceObserver as unknown) = mockPerformanceObserver;

// "queue" below is referring to
// https://www.w3.org/TR/performance-timeline-2/#queue-a-performanceentry

describe('lib/navigation-timing', () => {
  beforeEach(() => {
    sandbox.resetHistory();
  });

  after(() => {
    sandbox.restore();
  });

  describe('executes before PerformanceNavigationTiming object is queued', () => {
    it('uses PerformanceObserver', () => {
      mockGetEntriesByType([{ duration: 0 } as PerformanceEntry]);
      observeNavigationTiming('/x/y/z', sendFn);
      cb({ getEntries }, mockObs);
      sinon.assert.calledOnceWithExactly(observeFn, {
        entryTypes: ['navigation'],
      });
      const navTiming = { foo: 'bar' };
      sinon.assert.calledOnceWithExactly(sendFn, '/x/y/z', navTiming);
      sinon.assert.calledOnce(disconnectFn);
    });
  });

  describe('executes after PerformanceNavigationTiming has queued', () => {
    it('sends performance metrics from peformance.getEntriesByType', () => {
      const navTiming = { duration: 1289 };
      mockGetEntriesByType([navTiming as PerformanceEntry]);
      observeNavigationTiming('/x/y/z', sendFn);
      sinon.assert.calledOnceWithExactly(sendFn, '/x/y/z', navTiming);
    });
  });
});
