/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!./helpers/init-logging',
  'intern/dojo/node!path',
  'intern/dojo/node!proxyquire',
  'intern/dojo/node!sinon'
], function (intern, registerSuite, assert, initLogging, path, proxyquire, sinon) {
  // ensure we don't get any module from the cache, but to load it fresh every time
  proxyquire.noPreserveCache();
  var suite = {};

  suite['sanity check'] = function () {
    var test = setUp();

    assert.equal(test.metrics.method, 'post');
    assert.equal(test.metrics.path, '/metrics');
    assert.equal(typeof test.metrics.process, 'function');
    assert.equal(test.mocks.statsdCollector.init.callCount, 1);
    assert.lengthOf(test.mocks.statsdCollector.init.getCall(0).args, 0);

    tearDown();
  };

  suite['process responds with success immediately, calls process.nextTick'] = function () {
    var test = setUp();

    test.metrics.process(test.mocks.request, test.mocks.response);

    assert.equal(test.mocks.response.json.callCount, 1);
    assert.lengthOf(test.mocks.response.json.getCall(0).args, 1);
    var data = test.mocks.response.json.getCall(0).args[0];
    assert.lengthOf(Object.keys(data), 1);
    assert.isTrue(data.success);

    assert.equal(process.nextTick.callCount, 1);

    tearDown();
  };

  suite['Content-Type is unset, user is not sampled'] = function () {
    var test = setUp();

    test.mocks.request.body = {};
    test.metrics.process(test.mocks.request, test.mocks.response);
    test.callbacks.nextTick();

    assert.equal(test.mocks.logger.error.callCount, 0);

    assert.equal(test.mocks.request.get.callCount, 2);
    assert.lengthOf(test.mocks.request.get.getCall(0).args, 1);
    assert.equal(test.mocks.request.get.getCall(0).args[0], 'content-type');
    assert.lengthOf(test.mocks.request.get.getCall(1).args, 1);
    assert.equal(test.mocks.request.get.getCall(1).args[0], 'user-agent');

    assert.equal(test.mocks.metricsCollector.write.callCount, 0);
    assert.equal(test.mocks.statsdCollector.write.callCount, 0);
    assert.equal(test.mocks.gaCollector.write.callCount, 1);
    assert.lengthOf(test.mocks.gaCollector.write.getCall(0).args, 1);

    tearDown();
  };

  suite['Content-Type is unset, user is sampled'] = function () {
    var test = setUp(function () {
      return 'foo';
    });
    test.mocks.request.body = { bar: 'baz', isSampledUser: true };
    test.metrics.process(test.mocks.request, test.mocks.response);
    test.callbacks.nextTick();

    assert.equal(test.mocks.logger.error.callCount, 0);

    assert.equal(test.mocks.metricsCollector.write.callCount, 1);
    assert.lengthOf(test.mocks.metricsCollector.write.getCall(0).args, 1);
    var data = test.mocks.metricsCollector.write.getCall(0).args[0];
    assert.lengthOf(Object.keys(data), 3);
    assert.equal(data.agent, 'foo');
    assert.equal(data.bar, 'baz');
    assert.equal(data.isSampledUser, true);

    assert.equal(test.mocks.statsdCollector.write.callCount, 1);
    assert.lengthOf(test.mocks.statsdCollector.write.getCall(0).args, 1);
    assert.equal(test.mocks.statsdCollector.write.getCall(0).args[0], data);

    assert.equal(test.mocks.gaCollector.write.callCount, 1);
    assert.lengthOf(test.mocks.gaCollector.write.getCall(0).args, 1);
    assert.equal(test.mocks.gaCollector.write.getCall(0).args[0], data);

    tearDown();
  };

  suite['Content-Type is text/plain, data is invalid JSON'] = function () {
    var test = setUp(function (headerName) {
      if (headerName.toLowerCase() === 'content-type') {
        return 'text/plain';
      }

      return 'foo';
    });
    test.mocks.request.body = 'bar';
    test.metrics.process(test.mocks.request, test.mocks.response);
    test.callbacks.nextTick();

    assert.equal(test.mocks.logger.error.callCount, 1);
    assert.lengthOf(test.mocks.logger.error.getCall(0).args, 1);
    assert.instanceOf(test.mocks.logger.error.getCall(0).args[0], Error);

    assert.equal(test.mocks.metricsCollector.write.callCount, 0);
    assert.equal(test.mocks.statsdCollector.write.callCount, 0);
    assert.equal(test.mocks.gaCollector.write.callCount, 0);

    tearDown();
  };

  suite['Content-Type is text/plain, data is valid JSON, user is sampled'] = function () {
    var test = setUp(function (headerName) {
      if (headerName.toLowerCase() === 'content-type') {
        return 'text/plain';
      }

      return 'wibble';
    });
    test.mocks.request.body = '{"foo":"bar","isSampledUser":true}';
    test.metrics.process(test.mocks.request, test.mocks.response);
    test.callbacks.nextTick();

    assert.equal(test.mocks.logger.error.callCount, 0);

    assert.equal(test.mocks.metricsCollector.write.callCount, 1);
    var data = test.mocks.metricsCollector.write.getCall(0).args[0];
    assert.lengthOf(Object.keys(data), 3);
    assert.equal(data.agent, 'wibble');
    assert.equal(data.foo, 'bar');
    assert.equal(data.isSampledUser, true);

    assert.equal(test.mocks.statsdCollector.write.callCount, 1);
    assert.equal(test.mocks.statsdCollector.write.getCall(0).args[0], data);

    assert.equal(test.mocks.gaCollector.write.callCount, 1);
    assert.equal(test.mocks.gaCollector.write.getCall(0).args[0], data);

    tearDown();
  };

  suite['Content-Type is text/plain;charset=UTF-8, data is valid JSON, user is sampled'] = function () {
    var test = setUp(function (headerName) {
      if (headerName.toLowerCase() === 'content-type') {
        return 'text/plain;charset=UTF-8';
      }

      return 'foo';
    });
    test.mocks.request.body = '{"isSampledUser":true}';
    test.metrics.process(test.mocks.request, test.mocks.response);
    test.callbacks.nextTick();

    assert.equal(test.mocks.logger.error.callCount, 0);

    assert.equal(test.mocks.metricsCollector.write.callCount, 1);
    var data = test.mocks.metricsCollector.write.getCall(0).args[0];
    assert.lengthOf(Object.keys(data), 2);
    assert.equal(data.agent, 'foo');
    assert.equal(data.isSampledUser, true);

    assert.equal(test.mocks.statsdCollector.write.callCount, 1);
    assert.equal(test.mocks.statsdCollector.write.getCall(0).args[0], data);

    assert.equal(test.mocks.gaCollector.write.callCount, 1);
    assert.equal(test.mocks.gaCollector.write.getCall(0).args[0], data);

    tearDown();
  };

  registerSuite(suite);

  function setUp (requestGet) {
    var mocks = {
      gaCollector: { write: sinon.stub() },
      logger: { error: sinon.stub() },
      metricsCollector: { write: sinon.stub() },
      request: { get: requestGet ? sinon.spy(requestGet) : sinon.stub() },
      response: { json: sinon.stub() },
      statsdCollector: {
        init: sinon.stub(),
        write: sinon.stub()
      }
    };
    var callbacks = {};

    sinon.stub(process, 'nextTick', function (callback) {
      callbacks.nextTick = callback;
    });

    return {
      callbacks: callbacks,
      metrics: proxyquire(path.join(process.cwd(), 'server', 'lib', 'routes', 'post-metrics'), {
        mozlog: function () {
          return mocks.logger;
        },
        '../configuration': {
          get: function () {
            return {
              'stderr_collector_disabled': false
            };
          }
        },
        '../metrics-collector-stderr': function () {
          return mocks.metricsCollector;
        },
        '../statsd-collector': function () {
          return mocks.statsdCollector;
        },
        '../ga-collector': function () {
          return mocks.gaCollector;
        }
      })(),
      mocks: mocks
    };
  }

  function tearDown () {
    process.nextTick.restore();
  }
});
