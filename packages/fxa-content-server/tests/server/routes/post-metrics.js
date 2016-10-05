/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!bluebird',
  'intern/dojo/node!lodash',
  'intern/dojo/node!path',
  'intern/dojo/node!proxyquire',
  'intern/dojo/node!sinon',
  'intern/dojo/node!../helpers/init-logging'
], function (registerSuite, assert, Promise, _, path, proxyquire, sinon, initLogging) {
  var mocks, route, instance;

  registerSuite({
    name: 'routes/post-metrics',

    setup: function () {
      mocks = {
        config: {
          get: sinon.spy(function () {
            return false;
          })
        },
        flowEvent: sinon.spy(),
        gaCollector: {
          write: sinon.spy()
        },
        metricsCollector: {
          write: sinon.spy()
        },
        mozlog: {
          error: sinon.spy()
        },
        statsdCollector: {
          init: sinon.spy(),
          write: sinon.spy()
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
        assert.lengthOf(Object.keys(instance), 3);
        assert.equal(instance.method, 'post');
        assert.equal(instance.path, '/metrics');
        assert.isFunction(instance.process);
        assert.lengthOf(instance.process, 2);
      },

      'route.process': {
        setup: function () {
          sinon.stub(Date, 'now', function () {
            return 1000;
          });
          setupMetricsHandlerTests({
            /*eslint-disable sorting/sort-object-props*/
            data: {
              flowBeginTime: 42,
              flowId: 'qux',
              isSampledUser: true,
              startTime: 10,
              flushTime: 20
            },
            events: [
              { type: 'foo', offset: 0 },
              { type: 'bar', offset: 1 },
              { type: 'flow.signup.begin', offset: 2 },
              { type: 'baz', offset: 3 },
              { type: 'flow.signup.engage', offset: 4 }
            ],
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:47.0) Gecko/20100101 Firefox/47.0'
            /*eslint-enable sorting/sort-object-props*/
          });
        },

        teardown: function () {
          Date.now.restore();
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
            assert.lengthOf(Object.keys(args[0]), 7);

            assert.equal(args[0].agent, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:47.0) Gecko/20100101 Firefox/47.0');
            assert.isArray(args[0].events);
            assert.lengthOf(args[0].events, 5);
            assert.isObject(args[0].events[0]);
            assert.lengthOf(Object.keys(args[0].events[0]), 2);
            assert.equal(args[0].events[0].type, 'foo');
            assert.equal(args[0].events[0].offset, 0);
            assert.isObject(args[0].events[1]);
            assert.lengthOf(Object.keys(args[0].events[1]), 2);
            assert.equal(args[0].events[1].type, 'bar');
            assert.equal(args[0].events[1].offset, 1);
            assert.isObject(args[0].events[2]);
            assert.lengthOf(Object.keys(args[0].events[2]), 4);
            assert.equal(args[0].events[2].type, 'flow.signup.begin');
            assert.equal(args[0].events[2].offset, 2);
            assert.equal(args[0].events[2].time, 42);
            assert.equal(args[0].events[2].flowTime, 0);
            assert.isObject(args[0].events[3]);
            assert.lengthOf(Object.keys(args[0].events[3]), 2);
            assert.equal(args[0].events[3].type, 'baz');
            assert.equal(args[0].events[3].offset, 3);
            assert.isObject(args[0].events[4]);
            assert.lengthOf(Object.keys(args[0].events[4]), 4);
            assert.equal(args[0].events[4].type, 'flow.signup.engage');
            assert.equal(args[0].events[4].offset, 4);
            assert.equal(args[0].events[4].time, 994);
            assert.equal(args[0].events[4].flowTime, 952);
            assert.equal(args[0].flowId, 'qux');
            assert.equal(args[0].flowBeginTime, 42);
            assert.strictEqual(args[0].isSampledUser, true);
            assert.strictEqual(args[0].startTime, 10);
            assert.strictEqual(args[0].flushTime, 20);
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
            assert.strictEqual(mocks.flowEvent.callCount, 2);
            var args = mocks.flowEvent.args[0];
            assert.lengthOf(args, 3);
            assert.isObject(args[0]);
            assert.equal(args[0].type, 'flow.signup.begin');
            assert.strictEqual(args[0].flowTime, 0);
            assert.equal(args[0].time, 42);
            assert.isObject(args[1]);
            assert.equal(args[1].flowId, 'qux');
            assert.strictEqual(args[1].flowBeginTime, 42);
            assert.equal(args[2], mocks.request);
            // second flowEvent
            args = mocks.flowEvent.args[1];
            assert.isObject(args[0]);
            assert.equal(args[0].type, 'flow.signup.engage');
            assert.strictEqual(args[0].flowTime, 952);
            assert.equal(args[0].time, 994);
            assert.isObject(args[1]);
            assert.equal(args[1].flowId, 'qux');
            assert.strictEqual(args[1].flowBeginTime, 42);
            assert.equal(args[2], mocks.request);
          }
        }
      },

      'route.process without flow.begin event': {
        setup: function () {
          setupMetricsHandlerTests({
            data: {
              flowBeginTime: 42,
              flowId: 'qux',
              isSampledUser: true
            },
            events: [
              /*eslint-disable sorting/sort-object-props*/
              { type: 'foo', offset: 0 },
              { type: 'bar', offset: 1 },
              { type: 'baz', offset: 3 }
              /*eslint-enable sorting/sort-object-props*/
            ],
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:47.0) Gecko/20100101 Firefox/47.0'
          });
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

          'metricsCollector.write was called': function () {
            assert.strictEqual(mocks.metricsCollector.write.callCount, 2);
          },

          'statsdCollector.write was called': function () {
            assert.strictEqual(mocks.statsdCollector.write.callCount, 2);
          },

          'gaCollector.write was called': function () {
            assert.strictEqual(mocks.gaCollector.write.callCount, 2);
          },

          'flowEvent was not called': function () {
            assert.strictEqual(mocks.flowEvent.callCount, 2);
          }
        }
      },

      'route.process without isSampledUser': {
        setup: function () {
          setupMetricsHandlerTests({
            data: {
              flowBeginTime: 42,
              flowId: 'qux'
            },
            events: [
              /*eslint-disable sorting/sort-object-props*/
              { type: 'foo', offset: 0 },
              { type: 'bar', offset: 1 },
              { type: 'flow.signin.begin', offset: 2 },
              { type: 'baz', offset: 3 }
              /*eslint-enable sorting/sort-object-props*/
            ],
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:47.0) Gecko/20100101 Firefox/47.0'
          });
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
            assert.strictEqual(mocks.metricsCollector.write.callCount, 2);
          },

          'statsdCollector.write was not called': function () {
            assert.strictEqual(mocks.statsdCollector.write.callCount, 2);
          },

          'gaCollector.write was called': function () {
            assert.strictEqual(mocks.gaCollector.write.callCount, 3);
          },

          'flowEvent was called': function () {
            assert.strictEqual(mocks.flowEvent.callCount, 3);
          }
        }
      },

      'route.process with text/plain Content-Type': {
        setup: function () {
          setupMetricsHandlerTests({
            contentType: 'text/plain',
            data: {
              flowBeginTime: 77,
              flowId: 'bar',
              isSampledUser: true
            },
            events: [
              /*eslint-disable sorting/sort-object-props*/
              { type: 'flow.force_auth.begin', offset: 2 },
              { type: 'foo', offset: 3 }
              /*eslint-enable sorting/sort-object-props*/
            ],
            isBodyJSON: true,
            userAgent: 'baz'
          });
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

          'metricsCollector.write was called correctly': function () {
            assert.strictEqual(mocks.metricsCollector.write.callCount, 3);

            var args = mocks.metricsCollector.write.args[2];
            assert.lengthOf(args, 1);
            assert.isObject(args[0]);
            assert.lengthOf(Object.keys(args[0]), 5);

            assert.equal(args[0].agent, 'baz');
            assert.isArray(args[0].events);
            assert.lengthOf(args[0].events, 2);
            assert.equal(args[0].flowId, 'bar');
            assert.equal(args[0].flowBeginTime, 77);
            assert.strictEqual(args[0].isSampledUser, true);
          },

          'statsdCollector.write was called correctly': function () {
            assert.strictEqual(mocks.statsdCollector.write.callCount, 3);
            var args = mocks.statsdCollector.write.args[2];
            assert.lengthOf(args, 1);
            assert.isObject(args[0]);
          },

          'gaCollector.write was called correctly': function () {
            assert.strictEqual(mocks.gaCollector.write.callCount, 4);
            var args = mocks.gaCollector.write.args[3];
            assert.lengthOf(args, 1);
            assert.isObject(args[0]);
          },

          'flowEvent was called correctly': function () {
            assert.strictEqual(mocks.flowEvent.callCount, 4);
            var args = mocks.flowEvent.args[3];
            assert.lengthOf(args, 3);
            assert.isObject(args[0]);
            assert.equal(args[0].type, 'flow.force_auth.begin');
            assert.strictEqual(args[0].flowTime, 0);
            assert.equal(args[0].time, 77);
            assert.isObject(args[1]);
            assert.equal(args[1].flowId, 'bar');
            assert.strictEqual(args[1].flowBeginTime, 77);
            assert.equal(args[2], mocks.request);
          }
        }
      },

      'route.process with text/plain Content-Type and parsed JSON': {
        setup: function () {
          setupMetricsHandlerTests({
            contentType: 'text/plain',
            data: {
              flowBeginTime: 42,
              flowId: 'bar',
              isSampledUser: true
            },
            events: [
              /*eslint-disable sorting/sort-object-props*/
              { type: 'flow.wibble.begin', offset: 2 },
              { type: 'foo', offset: 3 }
              /*eslint-enable sorting/sort-object-props*/
            ],
            userAgent: 'baz'
          });
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

          'mozlog.error was called correctly': function () {
            assert.strictEqual(mocks.mozlog.error.callCount, 1);
            var args = mocks.mozlog.error.args[0];
            assert.lengthOf(args, 1);
            assert.instanceOf(args[0], Error);
          },

          'metricsCollector.write was not called': function () {
            assert.strictEqual(mocks.metricsCollector.write.callCount, 3);
          },

          'statsdCollector.write was not called': function () {
            assert.strictEqual(mocks.statsdCollector.write.callCount, 3);
          },

          'gaCollector.write was not called': function () {
            assert.strictEqual(mocks.gaCollector.write.callCount, 4);
          },

          'flowEvent was not called': function () {
            assert.strictEqual(mocks.flowEvent.callCount, 4);
          }
        }
      },

      'route.process without flowBeginTime': {
        setup: function () {
          sinon.stub(Date, 'now', function () {
            return 2000;
          });
          setupMetricsHandlerTests({
            /*eslint-disable sorting/sort-object-props*/
            data: {
              flowId: 'qux',
              isSampledUser: true,
              startTime: 1,
              flushTime: 2
            },
            events: [
              { type: 'foo', offset: 10 },
              { type: 'bar', offset: 20 },
              { type: 'flow.wibble.begin', offset: 30 },
              { type: 'baz', offset: 40 },
              { type: 'flow.wibble', offset: 50 }
            ],
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:47.0) Gecko/20100101 Firefox/47.0'
            /*eslint-enable sorting/sort-object-props*/
          });
        },

        teardown: function () {
          Date.now.restore();
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
            assert.strictEqual(mocks.mozlog.error.callCount, 1);
          },

          'metricsCollector.write was called': function () {
            assert.strictEqual(mocks.metricsCollector.write.callCount, 4);
          },

          'statsdCollector.write was called': function () {
            assert.strictEqual(mocks.statsdCollector.write.callCount, 4);
          },

          'gaCollector.write was called': function () {
            assert.strictEqual(mocks.gaCollector.write.callCount, 5);
          },

          'flowEvent was called correctly': function () {
            assert.strictEqual(mocks.flowEvent.callCount, 6);
            var args = mocks.flowEvent.args[4];
            assert.lengthOf(args, 3);
            assert.equal(args[0].type, 'flow.wibble.begin');
            assert.equal(args[0].time, 2029);
            assert.equal(args[0].flowTime, 0);
            assert.equal(args[1].flowId, 'qux');
            assert.strictEqual(args[1].flowBeginTime, 2029);
            args = mocks.flowEvent.args[5];
            assert.lengthOf(args, 3);
            assert.equal(args[0].type, 'flow.wibble');
            assert.equal(args[0].time, 2049);
            assert.equal(args[0].flowTime, 20);
            assert.equal(args[1].flowId, 'qux');
            assert.strictEqual(args[1].flowBeginTime, 2029);
          }
        }
      }
    }
  });

  function setupMetricsHandlerTests (options) {
    options = options || {};
    mocks.request = {
      body: {},
      get: sinon.spy(function (header) {
        switch (header.toLowerCase()) {
        case 'content-type':
          return options.contentType || 'application/json';
        case 'user-agent':
          return options.userAgent;
        }
        return '';
      })
    };
    if (options.events) {
      mocks.request.body.events = options.events;
    }
    if (options.data) {
      _.assign(mocks.request.body, options.data);
    }
    if (options.isBodyJSON) {
      mocks.request.body = JSON.stringify(mocks.request.body);
    }
    mocks.response = { json: sinon.spy() };
    mocks.nextTick = sinon.spy();
    var nextTickCopy = process.nextTick;
    process.nextTick = mocks.nextTick;
    instance.process(mocks.request, mocks.response);
    process.nextTick = nextTickCopy;
  }
});
