/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const sinon = require('sinon');
const sandbox = sinon.createSandbox();
const mockConfig = { get: sandbox.stub().returns({ enabled: true }) };
const mockStatsd = { timing: sandbox.stub() };
const route = require('../../../server/lib/routes/navigation-timing');

registerSuite('routes/navigation-timing', {
  beforeEach: function () {
    sandbox.resetHistory();
    sandbox.resetBehavior();
  },
  tests: {
    'interface is correct': function () {
      const instance = route(mockConfig, mockStatsd);
      assert.lengthOf(Object.keys(instance), 5);
      assert.equal(instance.method, 'post');
      assert.equal(instance.path, '/navigation-timing');
      assert.isFunction(instance.preProcess);
      assert.lengthOf(instance.preProcess, 3);
      assert.isFunction(instance.process);
      assert.lengthOf(instance.process, 2);
    },

    'responds early when statsd metrics is disabled': function () {
      mockConfig.get.returns({ enabled: false });
      const instance = route(mockConfig, mockStatsd);
      const next = sandbox.stub();
      const req = sandbox.stub();
      const end = sandbox.stub();
      const res = { status: sandbox.stub().returns({ end }) };
      instance.preProcess(req, res, next);
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWith(res.status, 200);
      sinon.assert.calledOnce(end);
      sinon.assert.notCalled(next);
    },

    'sends metrics with statsd': function () {
      const instance = route(mockConfig, mockStatsd);
      const req = {
        body: {
          connectEnd: 2,
          connectStart: 2,
          decodedBodySize: 2444,
          domainLookupEnd: 2,
          domainLookupStart: 2,
          domComplete: 1530,
          domContentLoadedEventEnd: 745,
          domContentLoadedEventStart: 713,
          domInteractive: 708,
          duration: 1531,
          encodedBodySize: 1108,
          entryType: 'navigation',
          fetchStart: 2,
          initiatorType: 'navigation',
          loadEventEnd: 1531,
          loadEventStart: 1530,
          name: 'http://localhost:3030/beta/settings?a=b#c',
          nextHopProtocol: 'h2',
          redirectCount: 0,
          redirectEnd: 0,
          redirectStart: 0,
          requestStart: 40,
          responseEnd: 145,
          responseStart: 145,
          secureConnectionStart: 2,
          serverTiming: [],
          startTime: 0,
          transferSize: 2204,
          type: 'navigate',
          unloadEventEnd: 0,
          unloadEventStart: 0,
          workerStart: 0,
        },
      };
      const tags = { path: 'beta_settings' };
      const end = sandbox.stub();
      const res = { status: sandbox.stub().returns({ end }) };
      instance.process(req, res);

      sinon.assert.calledWithExactly(
        mockStatsd.timing,
        'nt.network',
        req.body.responseStart - req.body.domainLookupStart,
        tags
      );
      sinon.assert.calledWithExactly(
        mockStatsd.timing,
        'nt.request',
        req.body.responseStart - req.body.requestStart,
        tags
      );
      sinon.assert.calledWithExactly(
        mockStatsd.timing,
        'nt.response',
        req.body.responseEnd - req.body.responseStart,
        tags
      );
      sinon.assert.calledWithExactly(
        mockStatsd.timing,
        'nt.dom',
        req.body.domComplete - req.body.domInteractive,
        tags
      );
      sinon.assert.calledWithExactly(
        mockStatsd.timing,
        'nt.load',
        req.body.loadEventEnd - req.body.loadEventStart,
        tags
      );
      sinon.assert.calledWithExactly(
        mockStatsd.timing,
        'nt.total',
        req.body.loadEventEnd - req.body.redirectStart,
        tags
      );
      sinon.assert.calledWithExactly(res.status, 200);
      sinon.assert.calledOnce(end);
    },
  },
});
