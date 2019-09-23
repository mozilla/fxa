/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const os = require('os');
const path = require('path');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
var config, sandbox, mocks, flowEvent, flowMetricsValidateResult;

registerSuite('flow-event', {
  beforeEach: function() {
    config = {
      /*eslint-disable camelcase*/
      flow_id_expiry: 7200000,
      flow_id_key: 'foo',
      flow_metrics_disabled: false,
      /*eslint-enable camelcase*/
    };
    sandbox = sinon.sandbox.create();
    sandbox.stub(process.stderr, 'write').callsFake(() => {});
    mocks = {
      amplitude: sinon.spy(),
      config: {
        get(key) {
          return config[key];
        },
      },
      flowMetrics: {
        validate: sandbox.spy(() => flowMetricsValidateResult),
      },
      geolocate: sandbox.spy(() => ({
        country: 'United States',
        state: 'California',
      })),
      request: {
        headers: {
          'user-agent': 'bar',
        },
        locale: 'en',
      },
      time: 1479127399349,
    };
    flowEvent = proxyquire(path.resolve('server/lib/flow-event'), {
      './amplitude': mocks.amplitude,
      './configuration': mocks.config,
      './flow-metrics': mocks.flowMetrics,
      './geo-locate': mocks.geolocate,
    }).metricsRequest;
  },

  afterEach: function() {
    sandbox.restore();
  },

  tests: {
    /*eslint-disable sorting/sort-object-props */
    'interface is correct': () => {
      assert.isFunction(flowEvent);
      assert.lengthOf(flowEvent, 3);
    },

    'call flowEvent with flow_metrics_disabled true': {
      beforeEach() {
        /*eslint-disable camelcase*/
        config.flow_metrics_disabled = true;
        /*eslint-enable camelcase*/

        const timeSinceFlowBegin = 1000;
        flowMetricsValidateResult = true;
        setup(
          {
            events: [
              { offset: 5, type: 'wibble' },
              { offset: 5, type: 'flow.begin' },
              { offset: 5.9, type: 'screen.signup' },
              {
                offset: timeSinceFlowBegin,
                type: 'flow.signup.good-offset-now',
              },
              {
                offset: timeSinceFlowBegin + 1,
                type: 'flow.signup.bad-offset-future',
              },
              {
                offset: timeSinceFlowBegin - config.flow_id_expiry - 1,
                type: 'flow.signup.bad-offset-expired',
              },
              {
                offset: timeSinceFlowBegin - config.flow_id_expiry,
                type: 'flow.signup.good-offset-oldest',
              },
              { offset: 500, type: 'flow.timing.foo.1' },
              { offset: 500, type: 'flow.timing.bar.baz.2' },
            ],
          },
          timeSinceFlowBegin
        );
      },

      'process.stderr.write was not called': () => {
        assert.equal(process.stderr.write.callCount, 0);
      },
    },

    'call flowEvent with valid flow data': {
      beforeEach() {
        const timeSinceFlowBegin = 1000;
        flowMetricsValidateResult = true;
        setup(
          {
            events: [
              { offset: 5, type: 'wibble' },
              { offset: 5, type: 'flow.begin' },
              { offset: 5.9, type: 'screen.signup' },
              {
                offset: timeSinceFlowBegin,
                type: 'flow.signup.good-offset-now',
              },
              {
                offset: timeSinceFlowBegin + 1,
                type: 'flow.signup.bad-offset-future',
              },
              {
                offset: timeSinceFlowBegin - config.flow_id_expiry - 1,
                type: 'flow.signup.bad-offset-expired',
              },
              {
                offset: timeSinceFlowBegin - config.flow_id_expiry,
                type: 'flow.signup.good-offset-oldest',
              },
              { offset: 500, type: 'flow.timing.foo.1' },
              { offset: 500, type: 'flow.timing.bar.baz.2' },
            ],
          },
          timeSinceFlowBegin
        );
      },
      tests: {
        'process.stderr.write was called six times': () => {
          assert.equal(process.stderr.write.callCount, 6);
        },

        'first call to process.stderr.write was correct': () => {
          const args = process.stderr.write.args[0];
          assert.lengthOf(args, 1);
          assert.equal(args[0][args[0].length - 1], '\n');
          assert.deepEqual(JSON.parse(args[0]), {
            /*eslint-disable camelcase*/
            context: 'fx_desktop_v3',
            country: 'United States',
            entrypoint: 'menupanel',
            event: 'flow.begin',
            flow_id:
              '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            flow_time: 0,
            hostname: os.hostname(),
            locale: 'en',
            migration: 'amo',
            op: 'flowEvent',
            pid: process.pid,
            region: 'California',
            service: '1234567890abcdef',
            time: new Date(mocks.time - 1000).toISOString(),
            userAgent: mocks.request.headers['user-agent'],
            utm_campaign: '.-Mock%20utm_campaign',
            utm_content: '.-Mock%20utm_content',
            utm_medium: '.-Mock%20utm_medium',
            utm_source: '.-Mock%20utm_source',
            v: 1,
            /*eslint-enable camelcase*/
          });
        },

        'second call to process.stderr.write was correct': () => {
          const arg = JSON.parse(process.stderr.write.args[1][0]);
          assert.lengthOf(Object.keys(arg), 20);
          assert.equal(arg.event, 'flow.signup.view');
          assert.equal(arg.flow_time, 5);
          assert.equal(arg.time, new Date(mocks.time - 995).toISOString());
        },

        'third call to process.stderr.write was correct': () => {
          const arg = JSON.parse(process.stderr.write.args[2][0]);
          assert.lengthOf(Object.keys(arg), 20);
          assert.equal(arg.event, 'flow.signup.good-offset-now');
          assert.equal(arg.time, new Date(mocks.time).toISOString());
        },

        'fourth call to process.stderr.write was correct': () => {
          const arg = JSON.parse(process.stderr.write.args[3][0]);
          assert.lengthOf(Object.keys(arg), 20);
          assert.equal(arg.event, 'flow.signup.good-offset-oldest');
          assert.equal(
            arg.time,
            new Date(mocks.time - config.flow_id_expiry).toISOString()
          );
        },

        'fifth call to process.stderr.write was correct': () => {
          const arg = JSON.parse(process.stderr.write.args[4][0]);
          assert.equal(arg.event, 'flow.timing.foo');
          assert.equal(arg.flow_time, 1);
          assert.equal(arg.time, new Date(mocks.time - 500).toISOString());
        },

        'sixth call to process.stderr.write was correct': () => {
          const arg = JSON.parse(process.stderr.write.args[5][0]);
          assert.equal(arg.event, 'flow.timing.bar.baz');
          assert.equal(arg.flow_time, 2);
          assert.equal(arg.time, new Date(mocks.time - 500).toISOString());
        },

        'amplitude was called seven times': () => {
          assert.equal(mocks.amplitude.callCount, 7);
        },

        'first call to amplitude was correct': () => {
          const args = mocks.amplitude.args[0];
          assert.lengthOf(args, 3);
          assert.deepEqual(args[0], {
            flowTime: 5,
            offset: 5,
            time: mocks.time - 995,
            type: 'wibble',
          });
          assert.equal(args[1], mocks.request);
          assert.deepEqual(args[2].location, {
            country: 'United States',
            state: 'California',
          });
          mocks.amplitude.firstCall.calledBefore(
            process.stderr.write.firstCall
          );
        },

        'second call to amplitude was correct': () => {
          const args = mocks.amplitude.args[1];
          assert.lengthOf(args, 3);
          assert.deepEqual(args[0], {
            flowTime: 0,
            offset: 5,
            time: mocks.time - 1000,
            type: 'flow.begin',
          });
          mocks.amplitude.secondCall.calledBefore(
            process.stderr.write.firstCall
          );
        },

        'third call to amplitude was correct': () => {
          const args = mocks.amplitude.args[2];
          assert.lengthOf(args, 3);
          assert.deepEqual(args[0], {
            flowTime: 5.89990234375,
            offset: 5.9,
            time: mocks.time - 994.1,
            type: 'screen.signup',
          });
          mocks.amplitude.thirdCall.calledBefore(
            process.stderr.write.secondCall
          );
        },

        'fourth call to amplitude was correct': () => {
          const args = mocks.amplitude.args[3];
          assert.lengthOf(args, 3);
          assert.deepEqual(args[0], {
            flowTime: 1000,
            offset: 1000,
            time: mocks.time,
            type: 'flow.signup.good-offset-now',
          });
        },

        'fifth call to amplitude was correct': () => {
          const args = mocks.amplitude.args[4];
          assert.lengthOf(args, 3);
          assert.deepEqual(args[0], {
            flowTime: 1000 - config.flow_id_expiry,
            offset: 1000 - config.flow_id_expiry,
            time: mocks.time - config.flow_id_expiry,
            type: 'flow.signup.good-offset-oldest',
          });
        },
      },
    },

    'call flowEvent with performance data': {
      beforeEach() {
        flowMetricsValidateResult = true;
        setup(
          {
            events: [{ offset: 2000, type: 'loaded' }],
            initialView: 'signup',
          },
          2000
        );
      },

      tests: {
        'process.stderr.write was called seven times': () => {
          assert.equal(process.stderr.write.callCount, 4);
        },

        'first call to process.stderr.write was correct': () => {
          const arg = JSON.parse(process.stderr.write.args[0][0]);
          assert.equal(arg.event, 'flow.performance.signup');
          assert.equal(arg.time, new Date(mocks.time).toISOString());
          assert.equal(arg.flow_time, 2000);
        },

        'second call to process.stderr.write was correct': () => {
          const arg = JSON.parse(process.stderr.write.args[1][0]);
          assert.equal(arg.event, 'flow.performance.signup.network');
          assert.equal(
            arg.time,
            new Date(mocks.time - 2000 + 300).toISOString()
          );
          assert.equal(arg.flow_time, 300);
        },

        'third call to process.stderr.write was correct': () => {
          const arg = JSON.parse(process.stderr.write.args[2][0]);
          assert.equal(arg.event, 'flow.performance.signup.server');
          assert.equal(
            arg.time,
            new Date(mocks.time - 2000 + 100).toISOString()
          );
          assert.equal(arg.flow_time, 100);
        },

        'fourth call to process.stderr.write was correct': () => {
          const arg = JSON.parse(process.stderr.write.args[3][0]);
          assert.equal(arg.event, 'flow.performance.signup.client');
          assert.equal(
            arg.time,
            new Date(mocks.time - 2000 + 200).toISOString()
          );
          assert.equal(arg.flow_time, 200);
        },

        'amplitude was called once': () => {
          assert.equal(mocks.amplitude.callCount, 1);
        },
      },
    },

    'call flowEvent with invalid flow id': {
      beforeEach() {
        flowMetricsValidateResult = true;
        setup(
          {
            flowId: '1234567890abcdef1234567890abcdef',
          },
          1000
        );
      },

      'process.stderr.write was not called': () => {
        assert.equal(process.stderr.write.callCount, 0);
      },

      'amplitude was not called': () => {
        assert.equal(mocks.amplitude.callCount, 0);
      },
    },

    'call flowEvent with invalid flow begin time': {
      beforeEach() {
        flowMetricsValidateResult = true;
        setup(
          {
            flowBeginTime: mocks.time + 1,
          },
          1000
        );
      },

      'process.stderr.write was not called': () => {
        assert.equal(process.stderr.write.callCount, 0);
      },

      'amplitude was not called': () => {
        assert.equal(mocks.amplitude.callCount, 0);
      },
    },

    'call flowEvent with string flow begin time': {
      beforeEach() {
        flowMetricsValidateResult = true;
        setup(
          {
            flowBeginTime: `${mocks.time - 1000}`,
          },
          1000
        );
      },

      'process.stderr.write was not called': () => {
        assert.equal(process.stderr.write.callCount, 0);
      },

      'amplitude was not called': () => {
        assert.equal(mocks.amplitude.callCount, 0);
      },
    },

    'call flowEvent with invalid context': {
      beforeEach() {
        flowMetricsValidateResult = true;
        setup(
          {
            context: '!',
          },
          1000
        );
      },

      'process.stderr.write was not called': () => {
        assert.equal(process.stderr.write.callCount, 0);
      },

      'amplitude was not called': () => {
        assert.equal(mocks.amplitude.callCount, 0);
      },
    },

    'call flowEvent with invalid entrypoint': {
      beforeEach() {
        flowMetricsValidateResult = true;
        setup(
          {
            entrypoint: '!',
          },
          1000
        );
      },

      'process.stderr.write was not called': () => {
        assert.equal(process.stderr.write.callCount, 0);
      },
    },

    'call flowEvent with invalid migration': {
      beforeEach() {
        flowMetricsValidateResult = true;
        setup(
          {
            migration: 'amo1',
          },
          1000
        );
      },

      'process.stderr.write was not called': () => {
        assert.equal(process.stderr.write.callCount, 0);
      },

      'amplitude was not called': () => {
        assert.equal(mocks.amplitude.callCount, 0);
      },
    },

    'call flowEvent with invalid service': {
      beforeEach() {
        flowMetricsValidateResult = true;
        setup(
          {
            service: '1234567890abcdef1234567890abcdef',
          },
          1000
        );
      },

      'process.stderr.write was not called': () => {
        assert.equal(process.stderr.write.callCount, 0);
      },

      'amplitude was not called': () => {
        assert.equal(mocks.amplitude.callCount, 0);
      },
    },

    'call flowEvent without optional flow data': {
      beforeEach() {
        const timeSinceFlowBegin = 1000;
        const flowBeginTime = mocks.time - timeSinceFlowBegin;
        flowMetricsValidateResult = true;
        mocks.request.locale = 'ar';
        flowEvent(
          mocks.request,
          {
            events: [{ offset: 0, type: 'flow.begin' }],
            flowBeginTime,
            flowId:
              '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            flushTime: flowBeginTime,
            startTime: flowBeginTime - timeSinceFlowBegin,
          },
          mocks.time
        );
      },
      tests: {
        'process.stderr.write was called once': () => {
          assert.equal(process.stderr.write.callCount, 1);
          const arg = JSON.parse(process.stderr.write.args[0][0]);
          assert.equal(arg.locale, 'ar');
          assert.isUndefined(arg.context);
          assert.isUndefined(arg.entrypoint);
          assert.isUndefined(arg.migration);
          assert.isUndefined(arg.service);
          assert.isUndefined(arg.utm_campaign);
          assert.isUndefined(arg.utm_content);
          assert.isUndefined(arg.utm_medium);
          assert.isUndefined(arg.utm_source);
          assert.isUndefined(arg.utm_term);
        },

        'amplitude was called once': () => {
          assert.equal(mocks.amplitude.callCount, 1);
        },
      },
    },

    'call flowEvent without flow id': {
      beforeEach() {
        const timeSinceFlowBegin = 1000;
        const flowBeginTime = mocks.time - timeSinceFlowBegin;
        flowMetricsValidateResult = true;
        flowEvent(
          mocks.request,
          {
            events: [{ offset: 0, type: 'flow.begin' }],
            flowBeginTime,
            flushTime: flowBeginTime,
            startTime: flowBeginTime - timeSinceFlowBegin,
          },
          mocks.time
        );
      },

      'process.stderr.write was not called': () => {
        assert.equal(process.stderr.write.callCount, 0);
      },

      'amplitude was not called': () => {
        assert.equal(mocks.amplitude.callCount, 0);
      },
    },

    'call flowEvent without flow begin time': {
      beforeEach() {
        const timeSinceFlowBegin = 1000;
        const flowBeginTime = mocks.time - timeSinceFlowBegin;
        flowMetricsValidateResult = true;
        flowEvent(
          mocks.request,
          {
            events: [{ offset: 0, type: 'flow.begin' }],
            flowId:
              '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            flushTime: flowBeginTime,
            startTime: flowBeginTime - timeSinceFlowBegin,
          },
          mocks.time
        );
      },

      'process.stderr.write was not called': () => {
        assert.equal(process.stderr.write.callCount, 0);
      },

      'amplitude was not called': () => {
        assert.equal(mocks.amplitude.callCount, 0);
      },
    },

    'call flowEvent with valid-seeming flow data but flowMetrics.validate returns false': {
      beforeEach() {
        flowMetricsValidateResult = false;
        setup({}, 1000);
      },

      'process.stderr.write was not called': () => {
        assert.equal(process.stderr.write.callCount, 0);
      },

      'amplitude was not called': () => {
        assert.equal(mocks.amplitude.callCount, 0);
      },
    },

    'call flowEvent without flow event': {
      beforeEach() {
        flowMetricsValidateResult = true;
        setup(
          {
            events: [{ offset: 0, type: 'blargh' }],
          },
          1000
        );
      },
      tests: {
        'process.stderr.write was not called': () => {
          assert.equal(process.stderr.write.callCount, 0);
        },

        'amplitude was called once': () => {
          assert.equal(mocks.amplitude.callCount, 1);
        },
      },
    },

    'call flowEvent with client_id': {
      beforeEach() {
        const timeSinceFlowBegin = 1000;
        const flowBeginTime = mocks.time - timeSinceFlowBegin;
        flowMetricsValidateResult = true;
        flowEvent(
          mocks.request,
          {
            client_id: 'deadbeefbaadf00d', //eslint-disable-line camelcase
            events: [{ offset: 0, type: 'flow.begin' }],
            flowBeginTime,
            flowId:
              '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            flushTime: flowBeginTime,
            startTime: flowBeginTime - timeSinceFlowBegin,
          },
          mocks.time
        );
      },
      tests: {
        'process.stderr.write was called correctly': () => {
          assert.equal(process.stderr.write.callCount, 1);
          const arg = JSON.parse(process.stderr.write.args[0][0]);
          assert.equal(arg.service, 'deadbeefbaadf00d');
        },
      },
    },

    'call flowEvent with invalid client_id': {
      beforeEach() {
        const timeSinceFlowBegin = 1000;
        const flowBeginTime = mocks.time - timeSinceFlowBegin;
        flowMetricsValidateResult = true;
        flowEvent(
          mocks.request,
          {
            client_id: 'deadbeef', //eslint-disable-line camelcase
            events: [{ offset: 0, type: 'flow.begin' }],
            flowBeginTime,
            flowId:
              '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            flushTime: flowBeginTime,
            startTime: flowBeginTime - timeSinceFlowBegin,
          },
          mocks.time
        );
      },
      tests: {
        'process.stderr.write was not called': () => {
          assert.equal(process.stderr.write.callCount, 0);
        },
      },
    },

    'call flowEvent with service and client_id': {
      beforeEach() {
        const timeSinceFlowBegin = 1000;
        const flowBeginTime = mocks.time - timeSinceFlowBegin;
        flowMetricsValidateResult = true;
        flowEvent(
          mocks.request,
          {
            client_id: 'deadbeefbaadf00d', //eslint-disable-line camelcase
            events: [{ offset: 0, type: 'flow.begin' }],
            flowBeginTime,
            flowId:
              '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            flushTime: flowBeginTime,
            service: '1234567890abcdef',
            startTime: flowBeginTime - timeSinceFlowBegin,
          },
          mocks.time
        );
      },
      tests: {
        'process.stderr.write was called correctly': () => {
          assert.equal(process.stderr.write.callCount, 1);
          const arg = JSON.parse(process.stderr.write.args[0][0]);
          assert.equal(arg.service, '1234567890abcdef');
        },
      },
    },

    'call flowEvent with entryPoint': {
      beforeEach() {
        const timeSinceFlowBegin = 1000;
        const flowBeginTime = mocks.time - timeSinceFlowBegin;
        flowMetricsValidateResult = true;
        flowEvent(
          mocks.request,
          {
            entryPoint: 'menubar',
            events: [{ offset: 0, type: 'flow.begin' }],
            flowBeginTime,
            flowId:
              '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            flushTime: flowBeginTime,
            startTime: flowBeginTime - timeSinceFlowBegin,
          },
          mocks.time
        );
      },
      tests: {
        'process.stderr.write was called correctly': () => {
          assert.equal(process.stderr.write.callCount, 1);
          const arg = JSON.parse(process.stderr.write.args[0][0]);
          assert.equal(arg.entrypoint, 'menubar');
        },
      },
    },

    'call flowEvent with invalid entryPoint': {
      beforeEach() {
        const timeSinceFlowBegin = 1000;
        const flowBeginTime = mocks.time - timeSinceFlowBegin;
        flowMetricsValidateResult = true;
        flowEvent(
          mocks.request,
          {
            entryPoint: '!',
            events: [{ offset: 0, type: 'flow.begin' }],
            flowBeginTime,
            flowId:
              '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            flushTime: flowBeginTime,
            startTime: flowBeginTime - timeSinceFlowBegin,
          },
          mocks.time
        );
      },
      tests: {
        'process.stderr.write was not called': () => {
          assert.equal(process.stderr.write.callCount, 0);
        },
      },
    },

    'call flowEvent with entrypoint and entryPoint': {
      beforeEach() {
        const timeSinceFlowBegin = 1000;
        const flowBeginTime = mocks.time - timeSinceFlowBegin;
        flowMetricsValidateResult = true;
        flowEvent(
          mocks.request,
          {
            entryPoint: 'menubar',
            entrypoint: 'menupanel',
            events: [{ offset: 0, type: 'flow.begin' }],
            flowBeginTime,
            flowId:
              '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            flushTime: flowBeginTime,
            startTime: flowBeginTime - timeSinceFlowBegin,
          },
          mocks.time
        );
      },
      tests: {
        'process.stderr.write was called correctly': () => {
          assert.equal(process.stderr.write.callCount, 1);
          const arg = JSON.parse(process.stderr.write.args[0][0]);
          assert.equal(arg.entrypoint, 'menupanel');
        },
      },
    },

    'call flowEvent with 101-character data': {
      beforeEach() {
        const timeSinceFlowBegin = 1000;
        const flowBeginTime = mocks.time - timeSinceFlowBegin;
        flowMetricsValidateResult = true;
        flowEvent(
          mocks.request,
          {
            context: new Array(102).join('0'),
            events: [{ offset: 0, type: 'flow.begin' }],
            flowBeginTime,
            flowId:
              '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            flushTime: flowBeginTime,
            startTime: flowBeginTime - timeSinceFlowBegin,
          },
          mocks.time
        );
      },
      tests: {
        'process.stderr.write was called correctly': () => {
          assert.equal(process.stderr.write.callCount, 1);
          const arg = JSON.parse(process.stderr.write.args[0][0]);
          assert.lengthOf(arg.context, 100);
        },
      },
    },

    'call flowEvent with 100-character data': {
      beforeEach() {
        const timeSinceFlowBegin = 1000;
        const flowBeginTime = mocks.time - timeSinceFlowBegin;
        flowMetricsValidateResult = true;
        flowEvent(
          mocks.request,
          {
            entrypoint: new Array(101).join('0'),
            events: [{ offset: 0, type: 'flow.begin' }],
            flowBeginTime,
            flowId:
              '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            flushTime: flowBeginTime,
            startTime: flowBeginTime - timeSinceFlowBegin,
          },
          mocks.time
        );
      },
      tests: {
        'process.stderr.write was called correctly': () => {
          assert.equal(process.stderr.write.callCount, 1);
          const arg = JSON.parse(process.stderr.write.args[0][0]);
          assert.lengthOf(arg.entrypoint, 100);
        },
      },
    },

    'call flowEvent with 101-character entryPoint': {
      beforeEach() {
        const timeSinceFlowBegin = 1000;
        const flowBeginTime = mocks.time - timeSinceFlowBegin;
        flowMetricsValidateResult = true;
        flowEvent(
          mocks.request,
          {
            entryPoint: new Array(102).join('x'), //eslint-disable-line camelcase
            events: [{ offset: 0, type: 'flow.begin' }],
            flowBeginTime,
            flowId:
              '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            flushTime: flowBeginTime,
            startTime: flowBeginTime - timeSinceFlowBegin,
          },
          mocks.time
        );
      },
      tests: {
        'process.stderr.write was called correctly': () => {
          assert.equal(process.stderr.write.callCount, 1);
          const arg = JSON.parse(process.stderr.write.args[0][0]);
          assert.lengthOf(arg.entrypoint, 100);
        },
      },
    },

    'call flowEvent with "none" data': {
      beforeEach() {
        const timeSinceFlowBegin = 1000;
        const flowBeginTime = mocks.time - timeSinceFlowBegin;
        flowMetricsValidateResult = true;
        flowEvent(
          mocks.request,
          {
            events: [{ offset: 0, type: 'flow.begin' }],
            flowBeginTime,
            flowId:
              '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            flushTime: flowBeginTime,
            migration: 'none',
            startTime: flowBeginTime - timeSinceFlowBegin,
          },
          mocks.time
        );
      },
      tests: {
        'process.stderr.write was called correctly': () => {
          assert.equal(process.stderr.write.callCount, 1);
          const arg = JSON.parse(process.stderr.write.args[0][0]);
          assert.isUndefined(arg.migration);
        },
      },
    },

    'call flowEvent with falsy data': {
      beforeEach() {
        const timeSinceFlowBegin = 1000;
        const flowBeginTime = mocks.time - timeSinceFlowBegin;
        flowMetricsValidateResult = true;
        flowEvent(
          mocks.request,
          {
            events: [{ offset: 0, type: 'flow.begin' }],
            flowBeginTime,
            flowId:
              '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            flushTime: flowBeginTime,
            service: 0,
            startTime: flowBeginTime - timeSinceFlowBegin,
          },
          mocks.time
        );
      },
      tests: {
        'process.stderr.write was called correctly': () => {
          assert.equal(process.stderr.write.callCount, 1);
          const arg = JSON.parse(process.stderr.write.args[0][0]);
          assert.isUndefined(arg.service);
        },
      },
    },

    'call flowEvent with DNT header': {
      beforeEach() {
        flowMetricsValidateResult = true;
        mocks.request.headers.dnt = '1';
        setup({}, 1000);
      },
      tests: {
        'process.stderr.write was called correctly': () => {
          assert.equal(process.stderr.write.callCount, 1);
          const arg = JSON.parse(process.stderr.write.args[0][0]);
          assert.isUndefined(arg.utm_campaign);
          assert.isUndefined(arg.utm_content);
          assert.isUndefined(arg.utm_medium);
          assert.isUndefined(arg.utm_source);
          assert.isUndefined(arg.utm_term);
        },
      },
    },

    'call flowEvent with invalid utm_campaign': {
      beforeEach() {
        flowMetricsValidateResult = true;
        setup(
          {
            utm_campaign: '!', //eslint-disable-line camelcase
          },
          1000
        );
      },
      tests: {
        'process.stderr.write was called correctly': () => {
          assert.equal(process.stderr.write.callCount, 1);
          const arg = JSON.parse(process.stderr.write.args[0][0]);
          assert.lengthOf(Object.keys(arg), 19);
          assert.isUndefined(arg.utm_campaign); //eslint-disable-line camelcase
        },
      },
    },

    'call flowEvent with invalid utm_content': {
      beforeEach() {
        flowMetricsValidateResult = true;
        setup(
          {
            utm_content: '"', //eslint-disable-line camelcase
          },
          1000
        );
      },
      tests: {
        'process.stderr.write was called correctly': () => {
          assert.equal(process.stderr.write.callCount, 1);
          const arg = JSON.parse(process.stderr.write.args[0][0]);
          assert.lengthOf(Object.keys(arg), 19);
          assert.isUndefined(arg.utm_content); //eslint-disable-line camelcase
        },
      },
    },

    'call flowEvent with invalid utm_medium': {
      beforeEach() {
        flowMetricsValidateResult = true;
        setup(
          {
            utm_medium: ';', //eslint-disable-line camelcase
          },
          1000
        );
      },
      tests: {
        'process.stderr.write was called correctly': () => {
          assert.equal(process.stderr.write.callCount, 1);
          const arg = JSON.parse(process.stderr.write.args[0][0]);
          assert.lengthOf(Object.keys(arg), 19);
          assert.isUndefined(arg.utm_medium); //eslint-disable-line camelcase
        },
      },
    },

    'call flowEvent with invalid utm_source': {
      beforeEach() {
        flowMetricsValidateResult = true;
        setup(
          {
            utm_source: '>', //eslint-disable-line camelcase
          },
          1000
        );
      },
      tests: {
        'process.stderr.write was called correctly': () => {
          assert.equal(process.stderr.write.callCount, 1);
          const arg = JSON.parse(process.stderr.write.args[0][0]);
          assert.lengthOf(Object.keys(arg), 19);
          assert.isUndefined(arg.utm_source); //eslint-disable-line camelcase
        },
      },
    },

    'call flowEvent with invalid loaded timing': {
      beforeEach() {
        flowMetricsValidateResult = true;
        setup(
          {
            events: [
              // The value of offset here puts the loaded event in the distant future
              { offset: 31536000000, type: 'loaded' },
            ],
            initialView: 'settings',
          },
          1000
        );
      },

      tests: {
        'process.stderr.write was called 6 times': () => {
          assert.equal(process.stderr.write.callCount, 3);
        },

        'first call to process.stderr.write was correct': () => {
          const arg = JSON.parse(process.stderr.write.args[0][0]);
          assert.equal(arg.event, 'flow.performance.settings.network');
        },

        'second call to process.stderr.write was correct': () => {
          const arg = JSON.parse(process.stderr.write.args[1][0]);
          assert.equal(arg.event, 'flow.performance.settings.server');
        },

        'third call to process.stderr.write was correct': () => {
          const arg = JSON.parse(process.stderr.write.args[2][0]);
          assert.equal(arg.event, 'flow.performance.settings.client');
        },
      },
    },

    'call flowEvent with invalid navigationTiming': {
      beforeEach() {
        flowMetricsValidateResult = true;
        setup(
          {
            events: [{ offset: 1000, type: 'loaded' }],
            initialView: 'reset-password',
            // The last arg here puts the navtiming events in the distant future
          },
          1000,
          false,
          31536000000
        );
      },

      tests: {
        'process.stderr.write was called once': () => {
          assert.equal(process.stderr.write.callCount, 1);
        },

        'first call to process.stderr.write was correct': () => {
          const arg = JSON.parse(process.stderr.write.args[0][0]);
          assert.equal(arg.event, 'flow.performance.reset-password');
        },
      },
    },

    'call flowEvent without navigationTiming data': {
      beforeEach() {
        flowMetricsValidateResult = true;
        setup(
          {
            events: [{ offset: 2000, type: 'loaded' }],
            initialView: 'signin',
          },
          2000,
          true
        );
      },
      tests: {
        'process.stderr.write was called correctly': () => {
          assert.equal(process.stderr.write.callCount, 1);
          const arg = JSON.parse(process.stderr.write.args[0][0]);
          assert.equal(arg.event, 'flow.performance.signin');
        },
      },
    },

    'call flowEvent for enter-email': {
      beforeEach() {
        flowMetricsValidateResult = true;
        setup(
          {
            events: [{ offset: 2000, type: 'loaded' }],
            initialView: 'enter-email',
          },
          2000,
          true
        );
      },
      tests: {
        'process.stderr.write was called correctly': () => {
          assert.equal(process.stderr.write.callCount, 1);
          const arg = JSON.parse(process.stderr.write.args[0][0]);
          assert.equal(arg.event, 'flow.performance.enter-email');
        },
      },
    },

    'call flowEvent for force-auth': {
      beforeEach() {
        flowMetricsValidateResult = true;
        setup(
          {
            events: [{ offset: 2000, type: 'loaded' }],
            initialView: 'force-auth',
          },
          2000,
          true
        );
      },
      tests: {
        'process.stderr.write was called correctly': () => {
          assert.equal(process.stderr.write.callCount, 1);
          const arg = JSON.parse(process.stderr.write.args[0][0]);
          assert.equal(arg.event, 'flow.performance.force-auth');
        },
      },
    },
  },
});

function setup(
  data,
  timeSinceFlowBegin,
  clobberNavigationTiming,
  navigationTimingValue
) {
  try {
    const flowBeginTime = data.flowBeginTime || mocks.time - timeSinceFlowBegin;
    flowEvent(
      mocks.request,
      {
        context: data.context || 'fx_desktop_v3',
        entrypoint: data.entrypoint || 'menupanel',
        events: data.events || [{ offset: 0, type: 'flow.begin' }],
        flowBeginTime,
        flowId:
          data.flowId ||
          '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        flushTime: flowBeginTime,
        initialView: data.initialView || 'signup',
        migration: data.migration || 'amo',
        navigationTiming: clobberNavigationTiming
          ? null
          : {
              /*eslint-disable sorting/sort-object-props*/
              navigationStart: 0,
              domainLookupStart: navigationTimingValue || 100,
              domainLookupEnd: navigationTimingValue || 200,
              connectStart: navigationTimingValue || 300,
              connectEnd: navigationTimingValue || 400,
              requestStart: navigationTimingValue || 500,
              responseStart: navigationTimingValue || 600,
              responseEnd: navigationTimingValue || 700,
              domLoading: navigationTimingValue || 800,
              domComplete: navigationTimingValue || 1000,
              /*eslint-enable sorting/sort-object-props*/
            },
        service: data.service || '1234567890abcdef',
        startTime: flowBeginTime - timeSinceFlowBegin,
        /*eslint-disable camelcase*/
        utm_campaign: data.utm_campaign || '.-Mock%20utm_campaign',
        utm_content: data.utm_content || '.-Mock%20utm_content',
        utm_medium: data.utm_medium || '.-Mock%20utm_medium',
        utm_source: data.utm_source || '.-Mock%20utm_source',
        utm_term: data.utm_term || '.-Mock%20utm_term',
        /*eslint-enable camelcase*/
        zignore: 'ignore me',
      },
      mocks.time
    );
  } catch (err) {
    console.error(err.stack);
  }
}
