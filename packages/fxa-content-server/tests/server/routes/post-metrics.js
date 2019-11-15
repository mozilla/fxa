/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const _ = require('lodash');
const path = require('path');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
var mocks, route, instance, sandbox;

registerSuite('routes/post-metrics', {
  before: function() {
    sandbox = sinon.sandbox.create();
    mocks = {
      config: {
        get(key) {
          switch (key) {
            /*eslint-disable indent*/
            case 'client_metrics':
              return {
                max_event_offset: 1024, //eslint-disable-line camelcase
                stderr_collector_disabled: false, //eslint-disable-line camelcase
              };
            case 'flow_id_key':
              return 'foo';
            case 'flow_id_expiry':
              return 7200000;
            /*eslint-enable indent*/
          }

          return {};
        },
      },
      flowEvent: {
        metricsRequest: sandbox.spy(),
      },
      metricsCollector: {
        write: sandbox.spy(),
      },
      mozlog: {
        error: sandbox.spy(),
      },
    };
    route = proxyquire(
      path.join(process.cwd(), 'server/lib/routes/post-metrics'),
      {
        '../flow-event': mocks.flowEvent,
        '../configuration': mocks.config,
        '../metrics-collector-stderr': function() {
          return mocks.metricsCollector;
        },
        '../logging/log': function() {
          return mocks.mozlog;
        },
      }
    );
  },
  tests: {
    'route interface is correct': function() {
      assert.isFunction(route);
      assert.lengthOf(route, 0);
    },

    'initialise route': {
      before: function() {
        instance = route();
      },
      tests: {
        'instance interface is correct': function() {
          assert.isObject(instance);
          assert.lengthOf(Object.keys(instance), 5);
          assert.equal(instance.method, 'post');
          assert.equal(instance.path, '/metrics');
          assert.isFunction(instance.preProcess);
          assert.lengthOf(instance.preProcess, 3);
          assert.isFunction(instance.process);
          assert.lengthOf(instance.process, 2);
          assert.isObject(instance.validate);
          assert.lengthOf(Object.keys(instance.validate), 1);
          assert.isObject(instance.validate.body);
        },

        'route.preProcess': {
          'route.preProcess with text/plain Content-Type': {
            before: function() {
              sinon.stub(Date, 'now').callsFake(function() {
                return 1000;
              });
              setupMetricsHandlerTests({
                contentType: 'text/plain',
                data: JSON.stringify({
                  events: [
                    { type: 'flow.force_auth.begin', offset: 2 },
                    { type: 'foo', offset: 3 },
                  ],
                  flowBeginTime: 77,
                  flowId:
                    'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
                  isSampledUser: true,
                }),
                userAgent: 'baz',
              });
            },

            after() {
              Date.now.restore();
              sandbox.resetHistory();
            },
            tests: {
              'request.body was converted to an object': function() {
                assert.isObject(mocks.request.body);
              },

              'response.json was called': function() {
                assert.equal(mocks.response.json.callCount, 1);
              },

              'process.nextTick was called': function() {
                assert.equal(mocks.nextTick.callCount, 1);
              },
            },
          },
        },

        'route.process': {
          before: function() {
            sinon.stub(Date, 'now').callsFake(function() {
              return 1000;
            });
            setupMetricsHandlerTests({
              data: {
                events: [
                  { type: 'foo', offset: 0 },
                  { type: 'bar', offset: 1 },
                  { type: 'baz', offset: 2 },
                ],
                isSampledUser: true,
                startTime: 10,
                syncEngines: ['foo', 'bar'],
                flushTime: 20,
              },
              userAgent:
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:47.0) Gecko/20100101 Firefox/47.0',
            });
          },

          after: function() {
            Date.now.restore();
            sandbox.resetHistory();
          },

          tests: {
            'response.json was called correctly': function() {
              assert.equal(mocks.response.json.callCount, 1);
              var args = mocks.response.json.args[0];
              assert.lengthOf(args, 1);
              assert.isObject(args[0]);
              assert.lengthOf(Object.keys(args[0]), 1);
              assert.strictEqual(args[0].success, true);
            },

            'process.nextTick was called correctly': function() {
              assert.equal(mocks.nextTick.callCount, 1);
              var args = mocks.nextTick.args[0];
              assert.lengthOf(args, 1);
              assert.isFunction(args[0]);
            },

            'process.nextTick callback': {
              before: function() {
                mocks.nextTick.args[0][0]();
              },
              tests: {
                'mozlog.error was not called': function() {
                  assert.strictEqual(mocks.mozlog.error.callCount, 0);
                },

                'metricsCollector.write was called correctly': function() {
                  assert.strictEqual(mocks.metricsCollector.write.callCount, 1);

                  var args = mocks.metricsCollector.write.args[0];
                  assert.lengthOf(args, 1);
                  assert.equal(args[0], mocks.request.body);
                  assert.deepEqual(args[0], {
                    agent:
                      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:47.0) Gecko/20100101 Firefox/47.0',
                    events: [
                      { offset: 0, type: 'foo' },
                      { offset: 1, type: 'bar' },
                      { offset: 2, type: 'baz' },
                    ],
                    flushTime: 20,
                    isSampledUser: true,
                    startTime: 10,
                    syncEngines: ['foo', 'bar'],
                  });
                },

                'flowEvent.metricsRequest was called correctly': function() {
                  assert.strictEqual(
                    mocks.flowEvent.metricsRequest.callCount,
                    1
                  );
                  var args = mocks.flowEvent.metricsRequest.args[0];
                  assert.lengthOf(args, 3);
                  assert.equal(args[0], mocks.request);
                  assert.equal(args[1], mocks.request.body);
                  assert.equal(args[2], 1000);
                },
              },
            },
          },
        },

        'route.process with isSampledUser=false': {
          before: function() {
            sinon.stub(Date, 'now').callsFake(function() {
              return 1000;
            });
            setupMetricsHandlerTests({
              data: {
                events: [
                  { type: 'foo', offset: 0 },
                  { type: 'bar', offset: 1 },
                  { type: 'baz', offset: 2 },
                ],
                isSampledUser: false,
                startTime: 10,
                flushTime: 20,
              },
              userAgent:
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:47.0) Gecko/20100101 Firefox/47.0',
            });
          },

          after() {
            Date.now.restore();
            sandbox.resetHistory();
          },
          tests: {
            'response.json was called': function() {
              assert.equal(mocks.response.json.callCount, 1);
            },

            'process.nextTick was called': function() {
              assert.equal(mocks.nextTick.callCount, 1);
            },

            'process.nextTick callback': {
              before: function() {
                mocks.nextTick.args[0][0]();
              },
              tests: {
                'mozlog.error was not called': function() {
                  assert.strictEqual(mocks.mozlog.error.callCount, 0);
                },

                'metricsCollector.write was not called': function() {
                  assert.strictEqual(mocks.metricsCollector.write.callCount, 0);
                },

                'flowEvent was called': function() {
                  assert.strictEqual(
                    mocks.flowEvent.metricsRequest.callCount,
                    1
                  );
                },
              },
            },
          },
        },
      },
    },
  },
});

function setupMetricsHandlerTests(options) {
  options = options || {};
  mocks.request = {
    body: {},
    get: sandbox.spy(function(header) {
      switch (header.toLowerCase()) {
        case 'content-type':
          return options.contentType || 'application/json';
        case 'user-agent':
          return options.userAgent;
      }
      return '';
    }),
  };

  if (options.data) {
    _.assign(mocks.request.body, options.data);
  }
  mocks.response = { json: sandbox.spy() };
  mocks.nextTick = sandbox.spy();
  var nextTickCopy = process.nextTick;
  process.nextTick = mocks.nextTick;
  instance.preProcess(mocks.request, mocks.response, () => {
    instance.process(mocks.request, mocks.response);
    process.nextTick = nextTickCopy;
  });
}
