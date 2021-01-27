/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sinon from 'sinon';

type MockEntryList = { getEntries: () => [object] };
type ObsCallback = (_entries: MockEntryList, _obs: object) => undefined;
type sinonStub = ReturnType<typeof sinon.stub>;
let cb = (_entries: MockEntryList, _obs: object) => {};

const sandbox = sinon.createSandbox();
(global.navigator as unknown) = { sendBeacon: sandbox.stub() };
(global.fetch as sinonStub) = sandbox.stub();
(global.Request as unknown) = sandbox.stub();
(global.Blob as unknown) = class B {
  parts: any;
  options: any;
  constructor(parts: any, options: any) {
    this.parts = parts;
    this.options = options;
  }
};

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

import {
  observeNavigationTiming,
  sendFn,
} from '../../metrics/navigation-timing';

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
      observeNavigationTiming('/x/y/z');
      cb({ getEntries }, mockObs);
      sinon.assert.calledOnceWithExactly(observeFn, {
        entryTypes: ['navigation'],
      });
      const expectedJson = JSON.stringify({ foo: 'bar' });
      sinon.assert.calledOnceWithExactly(
        global.navigator.sendBeacon as sinonStub,
        '/x/y/z',
        new global.Blob([expectedJson], { type: 'application/json' })
      );
      sinon.assert.calledOnce(disconnectFn);
    });
  });

  describe('executes after PerformanceNavigationTiming has queued', () => {
    it('sends performance metrics from peformance.getEntriesByType', () => {
      const navTiming = { duration: 1289 };
      mockGetEntriesByType([navTiming as PerformanceEntry]);
      observeNavigationTiming('/x/y/z');
      const expectedJson = JSON.stringify(navTiming);
      sinon.assert.calledOnceWithExactly(
        global.navigator.sendBeacon as sinonStub,
        '/x/y/z',
        new global.Blob([expectedJson], { type: 'application/json' })
      );
    });
  });

  describe('uses fetch with keepalive when available', () => {
    it('sends navigation timing data with fetch', () => {
      ((global.Request as unknown) as sinonStub).prototype.keepalive = true;
      const navTiming = { duration: 1289 };
      mockGetEntriesByType([navTiming as PerformanceEntry]);
      observeNavigationTiming('/x/y/z', sendFn());
      const expectedJson = JSON.stringify(navTiming);
      sinon.assert.calledOnceWithExactly(global.fetch as sinonStub, '/x/y/z', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        keepalive: true,
        body: expectedJson,
      });
    });
  });
});
