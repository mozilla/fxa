/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!lodash',
  'intern/dojo/node!path',
  'intern/dojo/node!proxyquire',
  'intern/dojo/node!sinon',
  'intern/dojo/node!../helpers/init-logging'
], function (registerSuite, assert, _, path, proxyquire, sinon, initLogging) {
  var mocks, route, instance, sandbox;

  registerSuite({
    name: 'routes/post-metrics',

    setup: function () {
      sandbox = sinon.sandbox.create();
      mocks = {
        config: {
          get (key) {
            switch (key) {
              /*eslint-disable indent*/
              case 'client_metrics':
                return {
                  stderr_collector_disabled: false //eslint-disable-line camelcase
                };
              case 'flow_id_key':
                return 'foo';
              case 'flow_id_expiry':
                return 7200000;
              /*eslint-enable indent*/
            }

            return {};
          }
        },
        flowEvent: sandbox.spy(),
        gaCollector: {
          write: sandbox.spy()
        },
        metricsCollector: {
          write: sandbox.spy()
        },
        mozlog: {
          error: sandbox.spy()
        },
        statsdCollector: {
          init: sandbox.spy(),
          write: sandbox.spy()
        }
      };
      route = proxyquire(
        path.join(process.cwd(), 'server/lib/routes/post-metrics'), {
          '../flow-event': mocks.flowEvent,
          '../configuration': mocks.config,
          '../ga-collector': function () {
            return mocks.gaCollector;
          },
          '../metrics-collector-stderr': function () {
            return mocks.metricsCollector;
          },
          '../statsd-collector': function () {
            return mocks.statsdCollector;
          },
          'mozlog': function () {
            return mocks.mozlog;
          }
        }
      );
    },

    'route interface is correct': function () {
      assert.isFunction(route);
      assert.lengthOf(route, 0);
    },

    'initialise route': {
      setup: function () {
        instance = route();
      },

      'instance interface is correct': function () {
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
          setup: function () {
            sinon.stub(Date, 'now', function () {
              return 1000;
            });
            setupMetricsHandlerTests({
              contentType: 'text/plain',
              data: JSON.stringify({
                events: [
                  /*eslint-disable sorting/sort-object-props*/
                  { type: 'flow.force_auth.begin', offset: 2 },
                  { type: 'foo', offset: 3 }
                  /*eslint-enable sorting/sort-object-props*/
                ],
                flowBeginTime: 77,
                flowId: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
                isSampledUser: true
              }),
              userAgent: 'baz'
            });
          },

          teardown () {
            Date.now.restore();
            sandbox.reset();
          },

          'request.body was converted to an object': function () {
            assert.isObject(mocks.request.body);
          },

          'response.json was called': function () {
            assert.equal(mocks.response.json.callCount, 1);
          },

          'process.nextTick was called': function () {
            assert.equal(mocks.nextTick.callCount, 1);
          }
        }
      },

      'route.process': {
        setup: function () {
          sinon.stub(Date, 'now', function () {
            return 1000;
          });
          setupMetricsHandlerTests({
            /*eslint-disable sorting/sort-object-props*/
            data: {
              events: [
                { type: 'foo', offset: 0 },
                { type: 'bar', offset: 1 },
                { type: 'baz', offset: 2 }
              ],
              isSampledUser: true,
              startTime: 10,
              flushTime: 20
            },
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:47.0) Gecko/20100101 Firefox/47.0'
            /*eslint-enable sorting/sort-object-props*/
          });
        },

        teardown: function () {
          Date.now.restore();
          sandbox.reset();
        },

        'response.json was called correctly': function () {
          assert.equal(mocks.response.json.callCount, 1);
          var args = mocks.response.json.args[0];
          assert.lengthOf(args, 1);
          assert.isObject(args[0]);
          assert.lengthOf(Object.keys(args[0]), 1);
          assert.strictEqual(args[0].success, true);
        },

        'process.nextTick was called correctly': function () {
          assert.equal(mocks.nextTick.callCount, 1);
          var args = mocks.nextTick.args[0];
          assert.lengthOf(args, 1);
          assert.isFunction(args[0]);
        },

        'process.nextTick callback': {
          setup: function () {
            mocks.nextTick.args[0][0]();
          },

          'mozlog.error was not called': function () {
            assert.strictEqual(mocks.mozlog.error.callCount, 0);
          },

          'metricsCollector.write was called correctly': function () {
            assert.strictEqual(mocks.metricsCollector.write.callCount, 1);

            var args = mocks.metricsCollector.write.args[0];
            assert.lengthOf(args, 1);
            assert.equal(args[0], mocks.request.body);
            assert.deepEqual(args[0], {
              agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:47.0) Gecko/20100101 Firefox/47.0',
              events: [
                { offset: 0, type: 'foo' },
                { offset: 1, type: 'bar' },
                { offset: 2, type: 'baz' }
              ],
              flushTime: 20,
              isSampledUser: true,
              startTime: 10
            });
          },

          'statsdCollector.write was called correctly': function () {
            assert.strictEqual(mocks.statsdCollector.write.callCount, 1);
            var args = mocks.statsdCollector.write.args[0];
            assert.lengthOf(args, 1);
            assert.equal(args[0], mocks.request.body);
          },

          'gaCollector.write was called correctly': function () {
            assert.strictEqual(mocks.gaCollector.write.callCount, 1);
            var args = mocks.gaCollector.write.args[0];
            assert.lengthOf(args, 1);
            assert.equal(args[0], mocks.request.body);
          },

          'flowEvent was called correctly': function () {
            assert.strictEqual(mocks.flowEvent.callCount, 1);
            var args = mocks.flowEvent.args[0];
            assert.lengthOf(args, 3);
            assert.equal(args[0], mocks.request);
            assert.equal(args[1], mocks.request.body);
            assert.equal(args[2], 1000);
          }
        }
      },

      'route.process with isSampledUser=false': {
        setup: function () {
          sinon.stub(Date, 'now', function () {
            return 1000;
          });
          setupMetricsHandlerTests({
            /*eslint-disable sorting/sort-object-props*/
            data: {
              events: [
                { type: 'foo', offset: 0 },
                { type: 'bar', offset: 1 },
                { type: 'baz', offset: 2 }
              ],
              isSampledUser: false,
              startTime: 10,
              flushTime: 20
            },
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:47.0) Gecko/20100101 Firefox/47.0'
            /*eslint-enable sorting/sort-object-props*/
          });
        },

        teardown () {
          Date.now.restore();
          sandbox.reset();
        },

        'response.json was called': function () {
          assert.equal(mocks.response.json.callCount, 1);
        },

        'process.nextTick was called': function () {
          assert.equal(mocks.nextTick.callCount, 1);
        },

        'process.nextTick callback': {
          setup: function () {
            mocks.nextTick.args[0][0]();
          },

          'mozlog.error was not called': function () {
            assert.strictEqual(mocks.mozlog.error.callCount, 0);
          },

          'metricsCollector.write was not called': function () {
            assert.strictEqual(mocks.metricsCollector.write.callCount, 0);
          },

          'statsdCollector.write was not called': function () {
            assert.strictEqual(mocks.statsdCollector.write.callCount, 0);
          },

          'gaCollector.write was called': function () {
            assert.strictEqual(mocks.gaCollector.write.callCount, 1);
          },

          'flowEvent was called': function () {
            assert.strictEqual(mocks.flowEvent.callCount, 1);
          }
        }
      }
    }
  });

  function setupMetricsHandlerTests (options) {
    options = options || {};
    mocks.request = {
      body: {},
      get: sandbox.spy(function (header) {
        switch (header.toLowerCase()) {
        case 'content-type':
          return options.contentType || 'application/json';
        case 'user-agent':
          return options.userAgent;
        }
        return '';
      })
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
});
