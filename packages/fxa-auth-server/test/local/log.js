/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const sentryModule = require('../../lib/sentry');
const assert = { ...sinon.assert, ...require('chai').assert };
const proxyquire = require('proxyquire');

const { mockRequest, mockMetricsContext } = require('../mocks');

let sentryScope, mockSentry;

describe('log', () => {
  let logger, mocks, log;

  beforeEach(() => {
    mockSentry = {
      withScope: sinon.stub().callsFake((cb) => {
        sentryScope = { setContext: sinon.stub() };
        cb(sentryScope);
      }),
    };
    sinon.stub(sentryModule, 'reportSentryMessage').returns({});

    logger = {
      debug: sinon.spy(),
      error: sinon.spy(),
      critical: sinon.spy(),
      warn: sinon.spy(),
      info: sinon.spy(),
    };
    mocks = {
      '../config': {
        config: {
          get(name) {
            switch (name) {
              case 'log':
                return {
                  fmt: 'mozlog',
                };
              case 'domain':
                return 'example.com';
              case 'oauth.clientIds':
                return {
                  clientid: 'human readable name',
                };
              default:
                throw new Error(`unexpected config get: ${name}`);
            }
          },
        },
      },
      // These need to be `function` functions, not arrow functions,
      // otherwise proxyquire gets confused and errors out.
      // eslint-disable-next-line prefer-arrow-callback
      mozlog: sinon.spy(function () {
        return sinon.spy(() => logger);
      }),
      // eslint-disable-next-line prefer-arrow-callback
      './notifier': function () {
        return { send: sinon.spy() };
      },
      '@sentry/node': mockSentry,
    };
    log = proxyquire(
      '../../lib/log',
      mocks
    )({
      level: 'debug',
      name: 'test',
      stdout: { on: sinon.spy() },
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('initialised correctly', () => {
    assert.equal(mocks.mozlog.callCount, 1, 'mozlog was called once');
    const args = mocks.mozlog.args[0];
    assert.equal(args.length, 1, 'mozlog was passed one argument');
    assert.equal(
      Object.keys(args[0]).length,
      4,
      'number of mozlog arguments was correct'
    );
    assert.equal(args[0].app, 'test', 'app property was correct');
    assert.equal(args[0].level, 'debug', 'level property was correct');
    assert.equal(args[0].stream, process.stderr, 'stream property was correct');

    assert.equal(mocks.mozlog.callCount, 1, 'mozlog was called once');
    const returnValue = mocks.mozlog.returnValues[0];
    assert.equal(returnValue.callCount, 1, 'mozlog instance was called once');
    assert.equal(
      returnValue.args[0].length,
      0,
      'mozlog instance was passed no arguments'
    );

    assert.equal(logger.debug.callCount, 0, 'logger.debug was not called');
    assert.equal(logger.error.callCount, 0, 'logger.error was not called');
    assert.equal(
      logger.critical.callCount,
      0,
      'logger.critical was not called'
    );
    assert.equal(logger.warn.callCount, 0, 'logger.warn was not called');
    assert.equal(logger.info.callCount, 0, 'logger.info was not called');

    assert.equal(typeof log.trace, 'function', 'log.trace method was exported');
    assert.equal(typeof log.error, 'function', 'log.error method was exported');
    assert.equal(typeof log.fatal, 'function', 'log.fatal method was exported');
    assert.equal(typeof log.warn, 'function', 'log.warn method was exported');
    assert.equal(typeof log.info, 'function', 'log.info method was exported');
    assert.equal(typeof log.begin, 'function', 'log.begin method was exported');
    assert.equal(
      typeof log.notifyAttachedServices,
      'function',
      'log.notifyAttachedServices method was exported'
    );
    assert.equal(
      typeof log.activityEvent,
      'function',
      'log.activityEvent method was exported'
    );
    assert.equal(
      log.activityEvent.length,
      1,
      'log.activityEvent expects 1 argument'
    );
    assert.equal(
      typeof log.flowEvent,
      'function',
      'log.flowEvent method was exported'
    );
    assert.equal(log.flowEvent.length, 1, 'log.flowEvent expects 1 argument');
    assert.equal(
      typeof log.summary,
      'function',
      'log.summary method was exported'
    );
  });

  it('warns and fixes duplicate logger names', () => {
    const logModule = proxyquire('../../lib/log', mocks);

    const opts = {
      level: 'debug',
      name: 'test-duplicates',
      stdout: { on: sinon.spy() },
    };
    logModule(opts);
    logModule(opts);
    logModule(opts);

    // Edge case, user passes in already incremented name for some reason...
    logModule({ ...opts, name: 'test-duplicates-1' });

    assert.equal(mocks.mozlog.callCount, 5, 'mozlog was called 5 times');
    assert.calledWithMatch(mocks.mozlog, { app: 'test' });
    assert.calledWithMatch(mocks.mozlog, { app: opts.name });
    assert.calledWithMatch(mocks.mozlog, { app: opts.name + '-1' });
    assert.calledWithMatch(mocks.mozlog, { app: opts.name + '-2' });
    assert.calledWithMatch(mocks.mozlog, { app: opts.name + '-1-1' });
    assert.calledWithMatch(logger.warn, 'init', {
      msg: `Logger with name of ${opts.name} already registered. Adjusting name to ${opts.name}-1 to prevent double log scenario.`,
    });
    assert.calledWithMatch(logger.warn, 'init', {
      msg: `Logger with name of ${opts.name} already registered. Adjusting name to ${opts.name}-2 to prevent double log scenario.`,
    });
    assert.calledWithMatch(logger.warn, 'init', {
      msg: `Logger with name of ${opts.name}-1 already registered. Adjusting name to ${opts.name}-1-1 to prevent double log scenario.`,
    });
  });

  it('.activityEvent', () => {
    log.activityEvent({
      event: 'foo',
      uid: 'bar',
    });

    assert.equal(logger.info.callCount, 1, 'logger.info was called once');
    const args = logger.info.args[0];
    assert.equal(args.length, 2, 'logger.info was passed two arguments');
    assert.equal(args[0], 'activityEvent', 'first argument was correct');
    assert.deepEqual(
      args[1],
      {
        event: 'foo',
        uid: 'bar',
      },
      'second argument was event data'
    );

    assert.equal(logger.debug.callCount, 0, 'logger.debug was not called');
    assert.equal(logger.error.callCount, 0, 'logger.error was not called');
    assert.equal(
      logger.critical.callCount,
      0,
      'logger.critical was not called'
    );
    assert.equal(logger.warn.callCount, 0, 'logger.warn was not called');
  });

  it('.activityEvent with missing data', () => {
    log.activityEvent();

    assert.equal(logger.error.callCount, 1, 'logger.error was called once');
    const args = logger.error.args[0];
    assert.equal(args.length, 2, 'logger.error was passed two arguments');
    assert.equal(
      args[0],
      'log.activityEvent',
      'first argument was function name'
    );
    assert.deepEqual(
      args[1],
      {
        data: undefined,
      },
      'argument was correct'
    );

    assert.equal(logger.info.callCount, 0, 'logger.info was not called');
    assert.equal(logger.debug.callCount, 0, 'logger.debug was not called');
    assert.equal(
      logger.critical.callCount,
      0,
      'logger.critical was not called'
    );
    assert.equal(logger.warn.callCount, 0, 'logger.warn was not called');
  });

  it('.activityEvent with missing uid', () => {
    log.activityEvent({
      event: 'wibble',
    });

    assert.equal(logger.error.callCount, 1, 'logger.error was called once');
    const args = logger.error.args[0];
    assert.equal(args.length, 2, 'logger.error was passed two arguments');
    assert.equal(
      args[0],
      'log.activityEvent',
      'first argument was function name'
    );
    assert.deepEqual(
      args[1],
      {
        data: {
          event: 'wibble',
        },
      },
      'argument was correct'
    );

    assert.equal(logger.info.callCount, 0, 'logger.info was not called');
    assert.equal(logger.debug.callCount, 0, 'logger.debug was not called');
    assert.equal(
      logger.critical.callCount,
      0,
      'logger.critical was not called'
    );
    assert.equal(logger.warn.callCount, 0, 'logger.warn was not called');
  });

  it('.activityEvent with missing event', () => {
    log.activityEvent({
      uid: 'wibble',
    });

    assert.equal(logger.error.callCount, 1, 'logger.error was called once');
    const args = logger.error.args[0];
    assert.equal(args.length, 2, 'logger.error was passed two arguments');
    assert.equal(
      args[0],
      'log.activityEvent',
      'first argument was function name'
    );
    assert.deepEqual(
      args[1],
      {
        data: {
          uid: 'wibble',
        },
      },
      'argument was correct'
    );

    assert.equal(logger.info.callCount, 0, 'logger.info was not called');
    assert.equal(logger.debug.callCount, 0, 'logger.debug was not called');
    assert.equal(
      logger.critical.callCount,
      0,
      'logger.critical was not called'
    );
    assert.equal(logger.warn.callCount, 0, 'logger.warn was not called');
  });

  it('.flowEvent', () => {
    log.flowEvent({
      event: 'wibble',
      flow_id: 'blee',
      flow_time: 1000,
      time: 1483557217331,
    });

    assert.equal(logger.info.callCount, 1, 'logger.info was called once');
    const args = logger.info.args[0];
    assert.equal(args.length, 2, 'logger.info was passed two arguments');
    assert.equal(args[0], 'flowEvent', 'first argument was correct');
    assert.deepEqual(
      args[1],
      {
        event: 'wibble',
        flow_id: 'blee',
        flow_time: 1000,
        time: 1483557217331,
      },
      'second argument was event data'
    );

    assert.equal(logger.debug.callCount, 0, 'logger.debug was not called');
    assert.equal(
      logger.critical.callCount,
      0,
      'logger.critical was not called'
    );
    assert.equal(logger.warn.callCount, 0, 'logger.warn was not called');
    assert.equal(logger.error.callCount, 0, 'logger.error was not called');
  });

  it('.flowEvent with missing data', () => {
    log.flowEvent();

    assert.equal(logger.info.callCount, 0, 'logger.info was not called');
    assert.equal(logger.debug.callCount, 0, 'logger.debug was not called');
    assert.equal(logger.error.callCount, 0, 'logger.error was not called');
    assert.equal(
      logger.critical.callCount,
      0,
      'logger.critical was not called'
    );
    assert.equal(logger.warn.callCount, 0, 'logger.warn was not called');
  });

  it('.flowEvent with missing event', () => {
    log.flowEvent({
      flow_id: 'wibble',
      flow_time: 1000,
      time: 1483557217331,
    });

    assert.equal(logger.info.callCount, 0, 'logger.info was not called');
    assert.equal(logger.debug.callCount, 0, 'logger.debug was not called');
    assert.equal(logger.error.callCount, 0, 'logger.error was not called');
    assert.equal(
      logger.critical.callCount,
      0,
      'logger.critical was not called'
    );
    assert.equal(logger.warn.callCount, 0, 'logger.warn was not called');
  });

  it('.flowEvent with missing flow_id', () => {
    log.flowEvent({
      event: 'wibble',
      flow_time: 1000,
      time: 1483557217331,
    });

    assert.equal(logger.info.callCount, 0, 'logger.info was not called');
    assert.equal(logger.debug.callCount, 0, 'logger.debug was not called');
    assert.equal(logger.error.callCount, 0, 'logger.error was not called');
    assert.equal(
      logger.critical.callCount,
      0,
      'logger.critical was not called'
    );
    assert.equal(logger.warn.callCount, 0, 'logger.warn was not called');
  });

  it('.flowEvent with missing flow_time', () => {
    log.flowEvent({
      event: 'wibble',
      flow_id: 'blee',
      time: 1483557217331,
    });

    assert.equal(logger.info.callCount, 0, 'logger.info was not called');
    assert.equal(logger.debug.callCount, 0, 'logger.debug was not called');
    assert.equal(logger.error.callCount, 0, 'logger.error was not called');
    assert.equal(
      logger.critical.callCount,
      0,
      'logger.critical was not called'
    );
    assert.equal(logger.warn.callCount, 0, 'logger.warn was not called');
  });

  it('.flowEvent with missing time', () => {
    log.flowEvent({
      event: 'wibble',
      flow_id: 'blee',
      flow_time: 1000,
    });

    assert.equal(logger.info.callCount, 0, 'logger.info was not called');
    assert.equal(logger.debug.callCount, 0, 'logger.debug was not called');
    assert.equal(logger.error.callCount, 0, 'logger.error was not called');
    assert.equal(
      logger.critical.callCount,
      0,
      'logger.critical was not called'
    );
    assert.equal(logger.warn.callCount, 0, 'logger.warn was not called');
  });

  it('.error removes PII from error objects', () => {
    const err = new Error();
    err.email = 'test@example.com';
    log.error('unexpectedError', { err: err });

    assert.equal(logger.error.callCount, 1, 'logger.error was called once');
    const args = logger.error.args[0];
    assert.equal(
      args[0],
      'unexpectedError',
      'logger.error received "op" value'
    );
    assert.lengthOf(Object.keys(args[1]), 2);
    assert.equal(
      args[1].email,
      'test@example.com',
      'email is reported in top-level fields'
    );
    assert.isNull(
      args[1].err.email,
      'email should not be reported in error object'
    );
  });

  it('.summary should not log an info message and should still call request.emitRouteFlowEvent', () => {
    const emitRouteFlowEvent = sinon.spy();
    log.summary(
      {
        app: {
          accountRecreated: false,
          acceptLanguage: 'en',
          remoteAddressChain: ['95.85.19.180', '78.144.14.50'],
        },
        auth: {
          credentials: {
            email: 'quix',
            uid: 'quid',
          },
        },
        emitRouteFlowEvent: emitRouteFlowEvent,
        headers: {
          'user-agent': 'Firefox Fenix',
        },
        id: 'quuz',
        info: {
          received: Date.now(),
        },
        method: 'get',
        path: '/v1/frobnicate',
        payload: {
          reason: 'grault',
          redirectTo: 'garply',
          service: 'corge',
        },
        query: {
          keys: 'wibble',
        },
      },
      {
        code: 200,
        errno: 109,
        statusCode: 201,
        source: {
          formattedPhoneNumber: 'garply',
        },
      }
    );

    assert.equal(logger.info.callCount, 0);

    assert.equal(emitRouteFlowEvent.callCount, 1);
    assert.equal(emitRouteFlowEvent.args[0].length, 1);
    assert.deepEqual(emitRouteFlowEvent.args[0][0], {
      code: 200,
      errno: 109,
      statusCode: 201,
      source: {
        formattedPhoneNumber: 'garply',
      },
    });
    assert.equal(logger.error.callCount, 0);
  });

  describe('traceId', () => {
    it("doesn't set if tracing is not enabled", () => {
      log = proxyquire(
        '../../lib/log',
        mocks
      )({
        level: 'debug',
        name: 'test',
        stdout: { on: sinon.spy() },
      });

      log.info('op', {
        uid: 'bloop',
      });

      assert.calledOnceWithExactly(logger.info, 'op', { uid: 'bloop' });
    });

    it('should set trace id', () => {
      log = proxyquire(
        '../../lib/log',
        mocks
      )({
        level: 'debug',
        name: 'test',
        stdout: { on: sinon.spy() },
        nodeTracer: {
          getTraceId: sinon.stub().callsFake(() => 'fake trace id'),
        },
      });

      log.info('op', {
        uid: 'bloop',
      });
      assert.calledOnceWithExactly(logger.info, 'op', {
        uid: 'bloop',
        traceId: 'fake trace id',
      });

      log.debug('op', {
        uid: 'bloop',
      });
      assert.calledOnceWithExactly(logger.debug, 'op', {
        uid: 'bloop',
        traceId: 'fake trace id',
      });

      log.error('op', {
        uid: 'bloop',
      });
      assert.calledOnceWithExactly(logger.error, 'op', {
        uid: 'bloop',
        traceId: 'fake trace id',
      });
    });
  });

  it('.notifyAttachedServices should send a notification (with service=known clientid)', () => {
    const now = Date.now();
    const metricsContext = mockMetricsContext();
    const request = mockRequest({
      log,
      metricsContext,
      payload: {
        service: '0123456789abcdef',
        metricsContext: {
          entrypoint: 'wibble',
          entrypointExperiment: 'blee-experiment',
          entrypointVariation: 'blee-variation',
          flowBeginTime: now - 23,
          flowId:
            'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
          utmCampaign: 'utm campaign',
          utmContent: 'utm content',
          utmMedium: 'utm medium',
          utmSource: 'utm source',
          utmTerm: 'utm term',
        },
      },
    });
    sinon.stub(Date, 'now').callsFake(() => now);
    return log
      .notifyAttachedServices('login', request, {
        service: '0123456789abcdef',
        ts: now,
      })
      .then(() => {
        assert.equal(metricsContext.gather.callCount, 1);
        assert.equal(log.notifier.send.callCount, 1);
        assert.equal(log.notifier.send.args[0].length, 1);
        assert.deepEqual(log.notifier.send.args[0][0], {
          event: 'login',
          data: {
            clientId: '0123456789abcdef',
            service: '0123456789abcdef',
            timestamp: now,
            ts: now,
            iss: 'example.com',
            metricsContext: {
              time: now,
              entrypoint: 'wibble',
              entrypoint_experiment: 'blee-experiment',
              entrypoint_variation: 'blee-variation',
              flow_id: request.payload.metricsContext.flowId,
              flow_time: now - request.payload.metricsContext.flowBeginTime,
              flowBeginTime: request.payload.metricsContext.flowBeginTime,
              flowCompleteSignal: undefined,
              flowType: undefined,
              product_id: undefined,
              plan_id: undefined,
              utm_campaign: 'utm campaign',
              utm_content: 'utm content',
              utm_medium: 'utm medium',
              utm_source: 'utm source',
              utm_term: 'utm term',
            },
          },
        });
      })
      .finally(() => {
        Date.now.restore();
      });
  });

  it('.notifyAttachedServices should send a notification (with service=unknown clientid)', () => {
    const now = Date.now();
    const metricsContext = mockMetricsContext();
    const request = mockRequest({
      log,
      metricsContext,
      payload: {
        service: 'unknown-clientid',
        metricsContext: {
          entrypoint: 'wibble',
          flowBeginTime: now - 23,
          flowId:
            'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
          utmCampaign: 'utm campaign',
          utmContent: 'utm content',
          utmMedium: 'utm medium',
          utmSource: 'utm source',
          utmTerm: 'utm term',
        },
      },
    });
    sinon.stub(Date, 'now').callsFake(() => now);
    return log
      .notifyAttachedServices('login', request, {
        service: 'unknown-clientid',
        ts: now,
      })
      .then(() => {
        assert.equal(metricsContext.gather.callCount, 1);
        assert.equal(log.notifier.send.callCount, 1);
        assert.equal(log.notifier.send.args[0].length, 1);
        assert.deepEqual(log.notifier.send.args[0][0], {
          event: 'login',
          data: {
            service: 'unknown-clientid',
            timestamp: now,
            ts: now,
            iss: 'example.com',
            metricsContext: {
              time: now,
              entrypoint: 'wibble',
              entrypoint_experiment: undefined,
              entrypoint_variation: undefined,
              flow_id: request.payload.metricsContext.flowId,
              flow_time: now - request.payload.metricsContext.flowBeginTime,
              flowBeginTime: request.payload.metricsContext.flowBeginTime,
              flowCompleteSignal: undefined,
              flowType: undefined,
              plan_id: undefined,
              product_id: undefined,
              utm_campaign: 'utm campaign',
              utm_content: 'utm content',
              utm_medium: 'utm medium',
              utm_source: 'utm source',
              utm_term: 'utm term',
            },
          },
        });
      })
      .finally(() => {
        Date.now.restore();
      });
  });

  it('.notifyAttachedServices should send a notification (with service=sync)', () => {
    const now = Date.now();
    const metricsContext = mockMetricsContext();
    const request = mockRequest({
      log,
      metricsContext,
      payload: {
        service: 'sync',
        metricsContext: {
          entrypoint: 'wibble',
          flowBeginTime: now - 23,
          flowId:
            'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
          utmCampaign: 'utm campaign',
          utmContent: 'utm content',
          utmMedium: 'utm medium',
          utmSource: 'utm source',
          utmTerm: 'utm term',
        },
      },
    });
    sinon.stub(Date, 'now').callsFake(() => now);
    return log
      .notifyAttachedServices('login', request, { service: 'sync', ts: now })
      .then(() => {
        assert.equal(metricsContext.gather.callCount, 1);
        assert.equal(log.notifier.send.callCount, 1);
        assert.equal(log.notifier.send.args[0].length, 1);
        assert.deepEqual(log.notifier.send.args[0][0], {
          event: 'login',
          data: {
            service: 'sync',
            timestamp: now,
            ts: now,
            iss: 'example.com',
            metricsContext: {
              time: now,
              entrypoint: 'wibble',
              entrypoint_experiment: undefined,
              entrypoint_variation: undefined,
              flow_id: request.payload.metricsContext.flowId,
              flow_time: now - request.payload.metricsContext.flowBeginTime,
              flowBeginTime: request.payload.metricsContext.flowBeginTime,
              flowCompleteSignal: undefined,
              flowType: undefined,
              plan_id: undefined,
              product_id: undefined,
              utm_campaign: 'utm campaign',
              utm_content: 'utm content',
              utm_medium: 'utm medium',
              utm_source: 'utm source',
              utm_term: 'utm term',
            },
          },
        });
      })
      .finally(() => {
        Date.now.restore();
      });
  });
});
