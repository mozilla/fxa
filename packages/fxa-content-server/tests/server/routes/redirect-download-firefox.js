/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const sinon = require('sinon');
const proxyquire = require('proxyquire');

let instance;
let mocks;
let request;
let response;
let route;

registerSuite('routes/redirect-download-firefox', {
  before: function() {
    mocks = {
      amplitude: sinon.spy(),
      config: {
        get(key) {
          switch (key) {
            case 'flow_id_key':
              return 'foo';
            case 'flow_id_expiry':
              return 7200000;
          }
        },
      },
      flowEvent: {
        logFlowEvent: sinon.spy(),
      },
    };

    route = proxyquire('../../../server/lib/routes/redirect-download-firefox', {
      '../amplitude': mocks.amplitude,
      '../flow-event': mocks.flowEvent,
    });
  },

  'route interface is correct': function() {
    assert.isFunction(route);
    assert.lengthOf(route, 1);
  },

  tests: {
    'initialise route': {
      before: function() {
        instance = route(mocks.config);
      },

      tests: {
        'instance interface is correct': function() {
          assert.isObject(instance);
          assert.lengthOf(Object.keys(instance), 4);
          assert.equal(instance.method, 'get');
          assert.equal(instance.path, '/download_firefox');
          assert.isObject(instance.validate);
          assert.isFunction(instance.process);
          assert.lengthOf(instance.process, 2);
        },

        'route.process': {
          before: function() {
            request = {
              query: {
                deviceId: 'foo',
                flowBeginTime: Date.now() - 1, // add the -1 to ensure flowTime is always > 0
                flowId: 'biz',
                service: 'sync',
              },
            };
            response = { redirect: sinon.spy() };
            instance.process(request, response);
          },

          tests: {
            'response.redirect was called correctly': function() {
              assert.isTrue(
                response.redirect.calledOnceWith(
                  'https://www.mozilla.org/firefox/download/thanks/'
                )
              );
            },

            'logs flow.update-firefox.engage amplitude and flow events': function() {
              assert.equal(mocks.amplitude.callCount, 1);
              assert.equal(mocks.flowEvent.logFlowEvent.callCount, 1);

              let args = mocks.amplitude.args[0];
              assert.equal(args.length, 3);
              assert.equal(args[0].flowTime, request.query.flowBeginTime);
              assert.ok(args[0].time);
              assert.equal(args[0].type, 'flow.update-firefox.engage');
              assert.equal(args[2].deviceId, 'foo');
              assert.equal(args[2].flowId, 'biz');
              assert.equal(args[2].service, 'sync');

              args = mocks.flowEvent.logFlowEvent.args[0];
              const eventData = args[0];
              const metricsData = args[1];
              assert.ok(eventData.flowTime);
              assert.ok(eventData.time);
              assert.equal(eventData.type, 'flow.update-firefox.engage');
              assert.equal(metricsData.deviceId, 'foo');
              assert.equal(metricsData.flowId, 'biz');
              assert.equal(metricsData.service, 'sync');
            },
          },
        },
      },
    },
  },
});
