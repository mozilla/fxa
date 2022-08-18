/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sinon from 'sinon';
import { InvalidNavigationTimingError } from '../../metrics/metric-errors';
import {
  checkNavTiming,
  observeNavigationTiming,
} from '../../metrics/navigation-timing';
const { assert } = require('chai');

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

  describe('detects invalid navigation timings', () => {
    it('detects missing value violation', () => {
      assert.deepInclude(
        checkNavTiming({}).map((x) => x.message),
        new InvalidNavigationTimingError(
          `navTiming.domainLookupStart`,
          'missing',
          false,
          undefined,
          0
        ).message
      );
    });

    it('detects minimum values violation', () => {
      assert.deepInclude(
        checkNavTiming({
          domainLookupStart: -1,
        }).map((x) => x.message),
        new InvalidNavigationTimingError(
          `navTiming.domainLookupStart`,
          'less than 0',
          false,
          -1,
          0
        ).message
      );
    });

    it('detects relative value violation', () => {
      assert.deepInclude(
        checkNavTiming({
          domainLookupStart: 100,
          requestStart: 1,
        }).map((x) => x.message),
        new InvalidNavigationTimingError(
          `navTiming.requestStart`,
          'less than domainLookupStart',
          false,
          1,
          100
        ).message
      );
    });

    it('detects relative value violation', () => {
      assert.deepInclude(
        checkNavTiming({
          domainLookupStart: 100,
          requestStart: 1,
        }).map((x) => x.message),
        new InvalidNavigationTimingError(
          `navTiming.requestStart`,
          'less than domainLookupStart',
          false,
          1,
          100
        ).message
      );
    });

    it('detects allows undefined min', () => {
      assert.notDeepInclude(
        checkNavTiming({
          redirectStart: -100,
        }).map((x) => x.message),
        new InvalidNavigationTimingError(
          `navTiming.redirectStart`,
          'less than 0',
          false,
          -100,
          0
        ).message
      );
    });
  });
});
