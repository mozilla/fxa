/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const { registerSuite } = intern.getInterface('object');
const { assert } = intern.getPlugin('chai');
const got = require('got');
const joi = require('joi');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const origin = require('../../../server/lib/configuration').get(
  'allowed_metrics_flow_cors_origins'
)[0];
const serverUrl = intern._config.fxaContentRoot.replace(/\/$/, '/metrics-flow');

let instance, request, response, route, mocks, sandbox;

registerSuite('routes/get-metrics-flow', {
  before: function() {
    sandbox = sinon.sandbox.create();
    mocks = {
      amplitude: sandbox.spy(),
      config: {
        get(key) {
          switch (key) {
            case 'allowed_metrics_flow_cors_origins':
              return ['https://mozilla.org'];
            case 'flow_id_key':
              return 'foo';
            case 'flow_id_expiry':
              return 7200000;
          }
        },
      },
      flowEvent: {
        logFlowEvent: sandbox.spy(),
      },
      geolocate: sandbox.spy(() => ({
        country: 'United States',
        state: 'California',
      })),
      log: {
        info: sandbox.spy(),
      },
    };
    route = proxyquire('../../../server/lib/routes/get-metrics-flow', {
      '../amplitude': mocks.amplitude,
      '../flow-event': mocks.flowEvent,
      '../geo-locate': mocks.geolocate,
      '../logging/log': () => mocks.log,
    });
    instance = route(mocks.config);

    request = {
      headers: {},
    };
    response = { json: sandbox.spy() };
  },

  afterEach: function() {
    sandbox.resetHistory();
  },

  tests: {
    'route interface is correct': function() {
      assert.isFunction(route);
      assert.lengthOf(route, 1);
    },

    'instance interface is correct': function() {
      assert.isObject(instance);
      assert.lengthOf(Object.keys(instance), 5);
      assert.equal(instance.method, 'get');
      assert.equal(instance.path, '/metrics-flow');
      assert.isObject(instance.cors);
      assert.isFunction(instance.cors.origin);
      assert.equal(instance.cors.methods, 'GET');
      assert.isFunction(instance.process);
      assert.lengthOf(instance.process, 2);
      assert.isObject(instance.validate);
      assert.isObject(instance.validate.query);
    },

    'response.json was called correctly': function() {
      instance.process(request, response);
      assert.equal(response.json.callCount, 1);
      const args = response.json.args[0];
      assert.lengthOf(args, 1);
      assert.match(args[0].deviceId, /^[0-9a-f]{32}$/);
      assert.isAbove(args[0].flowBeginTime, Date.now() - 1000);
      assert.isAtMost(args[0].flowBeginTime, Date.now());
      assert.match(args[0].flowId, /^[0-9a-f]{64}$/);

      assert.equal(mocks.flowEvent.logFlowEvent.callCount, 1);
      const argsFlowEvent = mocks.flowEvent.logFlowEvent.args[0];
      assert.equal(argsFlowEvent.length, 3);
    },

    'supports query params and logs begin amplitude and flow events': function() {
      request = {
        headers: {},
        query: {
          context: 'blee',
          entrypoint: 'zoo',
          entrypoint_experiment: 'herf',
          entrypoint_variation: 'menk',
          form_type: 'other',
          service: 'sync',
          utm_campaign: 'foo',
          utm_content: 'bar',
          utm_medium: 'biz',
          utm_source: 'baz',
          utm_term: 'quix',
        },
      };
      instance.process(request, response);

      assert.isFalse(mocks.log.info.called);

      assert.equal(mocks.amplitude.callCount, 1);
      let args = mocks.amplitude.args[0];
      assert.equal(args.length, 3);
      assert.ok(args[0].flowTime);
      assert.ok(args[0].time);
      assert.equal(args[0].type, 'flow.begin');
      assert.equal(args[2].entrypoint, 'zoo');
      assert.equal(args[2].entrypoint_experiment, 'herf');
      assert.equal(args[2].entrypoint_variation, 'menk');
      assert.equal(args[2].location.country, 'United States');
      assert.equal(args[2].location.state, 'California');
      assert.ok(args[2].flowId);
      assert.ok(args[2].deviceId);
      assert.notEqual(args[2].deviceId, args[2].flowId);

      assert.equal(mocks.flowEvent.logFlowEvent.callCount, 1);
      args = mocks.flowEvent.logFlowEvent.args[0];
      const eventData = args[0];
      const metricsData = args[1];
      assert.ok(eventData.flowTime);
      assert.ok(eventData.time);
      assert.equal(eventData.type, 'flow.begin');
      assert.equal(metricsData.entrypoint, 'zoo');
      assert.ok(metricsData.flowId);
      assert.ok(metricsData.deviceId);
    },

    'invalid context query parameter': function() {
      const query = {
        context: 'con text',
      };

      const validation = joi.object(instance.validate.query);
      const result = validation.validate(query);
      assert.ok(result.error);
      const error = result.error.details[0];
      assert.equal(error.path, 'context');
      assert.equal(error.context.value, 'con text');
    },

    'invalid entrypoint query parameter': function() {
      const query = {
        entrypoint: 'foo bar',
      };

      const validation = joi.object(instance.validate.query);
      const result = validation.validate(query);
      assert.ok(result.error);
      const error = result.error.details[0];
      assert.equal(error.path, 'entrypoint');
      assert.equal(error.context.value, 'foo bar');
    },

    'invalid form_type query parameter': function() {
      const query = {
        form_type: 'biz',
      };

      const validation = joi.object(instance.validate.query);
      const result = validation.validate(query);
      assert.ok(result.error);
      const error = result.error.details[0];
      assert.equal(error.path, 'form_type');
      assert.equal(error.context.value, 'biz');
    },

    'invalid service query parameter': function() {
      const query = {
        service: 'zzzz',
      };

      const validation = joi.object(instance.validate.query);
      const result = validation.validate(query);
      assert.ok(result.error);
      const error = result.error.details[0];
      assert.equal(error.path, 'service');
      assert.equal(error.context.value, 'zzzz');
    },

    'invalid utm_campaign query parameter': function() {
      const query = {
        utm_campaign: 1,
      };

      const validation = joi.object(instance.validate.query);
      const result = validation.validate(query);
      assert.ok(result.error);
      const error = result.error.details[0];
      assert.equal(error.path, 'utm_campaign');
      assert.equal(error.context.value, 1);
    },

    'invalid utm_content query parameter': function() {
      const query = {
        utm_content: 'qux qux',
      };

      const validation = joi.object(instance.validate.query);
      const result = validation.validate(query);
      assert.ok(result.error);
      const error = result.error.details[0];
      assert.equal(error.path, 'utm_content');
      assert.equal(error.context.value, 'qux qux');
    },

    'invalid utm_medium query parameter': function() {
      const query = {
        utm_medium: 'wimble!@$',
      };

      const validation = joi.object(instance.validate.query);
      const result = validation.validate(query);
      assert.ok(result.error);
      const error = result.error.details[0];
      assert.equal(error.path, 'utm_medium');
      assert.equal(error.context.value, 'wimble!@$');
    },

    'invalid utm_source query parameter': function() {
      const query = {
        utm_source: '%!@%womble',
      };

      const validation = joi.object(instance.validate.query);
      const result = validation.validate(query);
      assert.ok(result.error);
      const error = result.error.details[0];
      assert.equal(error.path, 'utm_source');
      assert.equal(error.context.value, '%!@%womble');
    },

    'invalid utm_term query parameter': function() {
      const query = {
        utm_term: 'jum!%^gle',
      };

      const validation = joi.object(instance.validate.query);
      const result = validation.validate(query);
      assert.ok(result.error);
      const error = result.error.details[0];
      assert.equal(error.path, 'utm_term');
      assert.equal(error.context.value, 'jum!%^gle');
    },

    'logs enter-email.view amplitude and flow events if form_type email is set': function() {
      request = {
        headers: {},
        query: {
          entrypoint: 'bar',
          form_type: 'email',
          service: 'sync',
          utm_campaign: 'foo',
          utm_content: 'bar',
          utm_medium: 'biz',
          utm_source: 'baz',
          utm_term: 'quix',
        },
      };
      instance.process(request, response);

      assert.isFalse(mocks.log.info.called);

      assert.equal(mocks.amplitude.callCount, 2);
      let args = mocks.amplitude.args[1];
      assert.equal(args.length, 3);
      assert.ok(args[0].flowTime);
      assert.ok(args[0].time);
      assert.equal(args[0].type, 'screen.enter-email');
      assert.equal(args[2].entrypoint, 'bar');
      assert.equal(args[2].location.country, 'United States');
      assert.equal(args[2].location.state, 'California');
      assert.ok(args[2].flowId);

      assert.equal(mocks.flowEvent.logFlowEvent.callCount, 2);
      args = mocks.flowEvent.logFlowEvent.args[1];
      const eventData = args[0];
      const metricsData = args[1];
      assert.ok(eventData.flowTime);
      assert.ok(eventData.time);
      assert.equal(eventData.type, 'flow.enter-email.view');
      assert.equal(metricsData.entrypoint, 'bar');
      assert.ok(metricsData.flowId);
    },

    'logs button.view amplitude and flow events if form_type button is set': function() {
      request = {
        headers: {},
        query: {
          entrypoint: 'bar',
          form_type: 'button',
          service: 'sync',
          utm_campaign: 'foo',
          utm_content: 'bar',
          utm_medium: 'biz',
          utm_source: 'baz',
          utm_term: 'quix',
        },
      };
      instance.process(request, response);

      assert.isFalse(mocks.log.info.called);

      assert.equal(mocks.amplitude.callCount, 2);
      let args = mocks.amplitude.args[1];
      assert.equal(args.length, 3);
      assert.ok(args[0].flowTime);
      assert.ok(args[0].time);
      assert.equal(args[0].type, 'screen.rp-button');
      assert.equal(args[2].entrypoint, 'bar');
      assert.equal(args[2].location.country, 'United States');
      assert.equal(args[2].location.state, 'California');
      assert.ok(args[2].flowId);

      assert.equal(mocks.flowEvent.logFlowEvent.callCount, 2);
      args = mocks.flowEvent.logFlowEvent.args[1];
      const eventData = args[0];
      const metricsData = args[1];
      assert.ok(eventData.flowTime);
      assert.ok(eventData.time);
      assert.equal(eventData.type, 'flow.rp-button.view');
      assert.equal(metricsData.entrypoint, 'bar');
      assert.ok(metricsData.flowId);
    },

    'logs button.view amplitude and flow events if form_type subscribe is set': function() {
      request = {
        headers: {},
        query: {
          entrypoint: 'bar',
          form_type: 'subscribe',
          product_id: 'prod_fuaUSifnw92au',
          service: 'sync',
          utm_campaign: 'foo',
          utm_content: 'bar',
          utm_medium: 'biz',
          utm_source: 'baz',
          utm_term: 'quix',
        },
      };
      instance.process(request, response);

      assert.isFalse(mocks.log.info.called);

      assert.equal(mocks.amplitude.callCount, 2);
      let args = mocks.amplitude.args[1];
      assert.equal(args.length, 3);
      assert.ok(args[0].flowTime);
      assert.ok(args[0].time);
      assert.equal(args[0].type, 'screen.subscribe');
      assert.equal(args[2].entrypoint, 'bar');
      assert.equal(args[2].product_id, 'prod_fuaUSifnw92au');
      assert.equal(args[2].location.country, 'United States');
      assert.equal(args[2].location.state, 'California');
      assert.ok(args[2].flowId);

      assert.equal(mocks.flowEvent.logFlowEvent.callCount, 2);
      args = mocks.flowEvent.logFlowEvent.args[1];
      const eventData = args[0];
      const metricsData = args[1];
      assert.ok(eventData.flowTime);
      assert.ok(eventData.time);
      assert.equal(eventData.type, 'flow.subscribe.view');
      assert.equal(metricsData.entrypoint, 'bar');
      assert.equal(metricsData.product_id, 'prod_fuaUSifnw92au');
      assert.ok(metricsData.flowId);
    },

    'validates CORS': function() {
      const dfd = this.async(1000);
      const corsFunc = instance.cors.origin;

      corsFunc('https://google.com', (err, result) => {
        assert.equal(err.message, 'CORS Error');
        assert.equal(result, null);
        corsFunc('https://mozilla.org', (err, result) => {
          assert.equal(err, null);
          assert.equal(result, true);
          dfd.resolve();
        });
      });

      return dfd;
    },
  },
});

registerSuite('routes/get-metrics-flow remote request', {
  'valid query parameters': function() {
    const headers = {
      Origin: origin,
    };

    const query = {
      context: 'blee',
      entrypoint: 'zoo',
      entrypoint_experiment: 'herf',
      entrypoint_variation: 'menk',
      form_type: 'other',
      service: 'sync',
      utm_campaign: 'foo',
      utm_content: 'bar',
      utm_medium: 'biz',
      utm_source: 'baz',
      utm_term: 'quix',
    };

    return got(serverUrl, { headers, query });
  },

  'invalid context query parameter': function() {
    return testInvalidFlowQueryParam('context', 'con text');
  },

  'invalid entrypoint query parameter': function() {
    return testInvalidFlowQueryParam('entrypoint', 'foo bar');
  },

  'invalid entrypoint_experiment query parameter': function() {
    return testInvalidFlowQueryParam('entrypoint_experiment', 'herf menk');
  },

  'invalid entrypoint_variation query parameter': function() {
    return testInvalidFlowQueryParam('entrypoint_variation', 'menk herf');
  },

  'invalid form_type query parameter': function() {
    return testInvalidFlowQueryParam('form_type', 'biz');
  },

  'invalid service query parameter': function() {
    return testInvalidFlowQueryParam('service', 'zzzz');
  },

  'invalid utm_campaign query parameter': function() {
    return testInvalidFlowQueryParam('utm_campaign', 'moo cow');
  },

  'invalid utm_content query parameter': function() {
    return testInvalidFlowQueryParam('utm_content', 'quix quix');
  },

  'invalid utm_medium query parameter': function() {
    return testInvalidFlowQueryParam('utm_medium', 'wimble!@$');
  },

  'invalid utm_source query parameter': function() {
    return testInvalidFlowQueryParam('utm_source', '%!@%womble');
  },

  'invalid utm_term query parameter': function() {
    return testInvalidFlowQueryParam('utm_term', 'jum!%^gle');
  },
});

async function testInvalidFlowQueryParam(paramName, paramValue) {
  const query = { [paramName]: paramValue };
  const headers = {
    Origin: origin,
  };

  try {
    await got(serverUrl, { headers, query });
    assert.fail('request should have failed');
  } catch (err) {
    assert.equal(err.response.statusCode, 400);
    assert.include(JSON.parse(err.response.body).validation.keys, paramName);
  }
}
