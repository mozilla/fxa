/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


describe('log', () => {
  let logger: Record<string, jest.Mock>;
  let mockMozlog: jest.Mock;
  let mockMozlogInstance: jest.Mock;
  let mockSentry: Record<string, jest.Mock>;
  let mockReportSentryMessage: jest.Mock;
  let mockNotifierSend: jest.Mock;
  let sentryScope: { setContext: jest.Mock };
  let log: any;

  beforeEach(() => {
    jest.resetModules();

    logger = {
      debug: jest.fn(),
      error: jest.fn(),
      critical: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
    };

    mockMozlogInstance = jest.fn().mockReturnValue(logger);
    mockMozlog = jest.fn().mockReturnValue(mockMozlogInstance);

    sentryScope = { setContext: jest.fn() };
    mockSentry = {
      withScope: jest.fn().mockImplementation((cb: (scope: Record<string, jest.Mock>) => void) => {
        cb(sentryScope);
      }),
      getActiveSpan: jest.fn().mockReturnValue(undefined),
    };

    mockReportSentryMessage = jest.fn().mockReturnValue({});
    mockNotifierSend = jest.fn();

    jest.doMock('mozlog', () => mockMozlog);
    jest.doMock('@sentry/node', () => mockSentry);
    jest.doMock('../config', () => ({
      config: {
        get(name: string) {
          switch (name) {
            case 'log':
              return { fmt: 'mozlog' };
            case 'domain':
              return 'example.com';
            case 'oauth.clientIds':
              return { clientid: 'human readable name' };
            default:
              throw new Error(`unexpected config get: ${name}`);
          }
        },
      },
    }));
    jest.doMock('./notifier', () =>
      jest.fn().mockReturnValue({ send: mockNotifierSend })
    );
    jest.doMock('./sentry', () => ({
      reportSentryMessage: mockReportSentryMessage,
    }));
    jest.doMock('./oauth/validators', () => ({
      HEX_STRING: /^(?:[0-9a-f]{2})+$/,
    }));

    log = require('./log')({
      level: 'debug',
      name: 'test',
      stdout: { on: jest.fn() },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('initialised correctly', () => {
    // mozlog was called once with expected config
    expect(mockMozlog).toHaveBeenCalledTimes(1);
    const args = mockMozlog.mock.calls[0];
    expect(args).toHaveLength(1);
    expect(Object.keys(args[0])).toHaveLength(4);
    expect(args[0].app).toBe('test');
    expect(args[0].level).toBe('debug');
    expect(args[0].stream).toBe(process.stderr);

    // mozlog instance was called once with no arguments
    const returnValue = mockMozlog.mock.results[0].value;
    expect(returnValue).toHaveBeenCalledTimes(1);
    expect(returnValue.mock.calls[0]).toHaveLength(0);

    // No logger methods were called during init
    expect(logger.debug).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.critical).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.info).not.toHaveBeenCalled();

    // All expected methods are functions
    expect(typeof log.trace).toBe('function');
    expect(typeof log.error).toBe('function');
    expect(typeof log.fatal).toBe('function');
    expect(typeof log.warn).toBe('function');
    expect(typeof log.info).toBe('function');
    expect(typeof log.begin).toBe('function');
    expect(typeof log.notifyAttachedServices).toBe('function');
    expect(typeof log.activityEvent).toBe('function');
    expect(log.activityEvent.length).toBe(1);
    expect(typeof log.flowEvent).toBe('function');
    expect(log.flowEvent.length).toBe(1);
    expect(typeof log.summary).toBe('function');
  });

  it('warns and fixes duplicate logger names', () => {
    const logModule = require('./log');
    const opts = {
      level: 'debug',
      name: 'test-duplicates',
      stdout: { on: jest.fn() },
    };

    logModule(opts);
    logModule(opts);
    logModule(opts);

    // Edge case: user passes in already incremented name
    logModule({ ...opts, name: 'test-duplicates-1' });

    // Initial 'test' call + 4 calls above = 5
    expect(mockMozlog).toHaveBeenCalledTimes(5);
    expect(mockMozlog).toHaveBeenCalledWith(
      expect.objectContaining({ app: 'test' })
    );
    expect(mockMozlog).toHaveBeenCalledWith(
      expect.objectContaining({ app: opts.name })
    );
    expect(mockMozlog).toHaveBeenCalledWith(
      expect.objectContaining({ app: opts.name + '-1' })
    );
    expect(mockMozlog).toHaveBeenCalledWith(
      expect.objectContaining({ app: opts.name + '-2' })
    );
    expect(mockMozlog).toHaveBeenCalledWith(
      expect.objectContaining({ app: opts.name + '-1-1' })
    );

    expect(logger.warn).toHaveBeenCalledWith('init', {
      msg: `Logger with name of ${opts.name} already registered. Adjusting name to ${opts.name}-1 to prevent double log scenario.`,
    });
    expect(logger.warn).toHaveBeenCalledWith('init', {
      msg: `Logger with name of ${opts.name} already registered. Adjusting name to ${opts.name}-2 to prevent double log scenario.`,
    });
    expect(logger.warn).toHaveBeenCalledWith('init', {
      msg: `Logger with name of ${opts.name}-1 already registered. Adjusting name to ${opts.name}-1-1 to prevent double log scenario.`,
    });
  });

  it('.activityEvent', () => {
    log.activityEvent({
      event: 'foo',
      uid: 'bar',
    });

    expect(logger.info).toHaveBeenCalledTimes(1);
    const args = logger.info.mock.calls[0];
    expect(args).toHaveLength(2);
    expect(args[0]).toBe('activityEvent');
    expect(args[1]).toEqual({
      event: 'foo',
      uid: 'bar',
    });

    expect(logger.debug).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.critical).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('.activityEvent with missing data', () => {
    log.activityEvent();

    expect(logger.error).toHaveBeenCalledTimes(1);
    const args = logger.error.mock.calls[0];
    expect(args).toHaveLength(2);
    expect(args[0]).toBe('log.activityEvent');
    expect(args[1]).toEqual(expect.objectContaining({ data: undefined }));

    expect(logger.info).not.toHaveBeenCalled();
    expect(logger.debug).not.toHaveBeenCalled();
    expect(logger.critical).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('.activityEvent with missing uid', () => {
    log.activityEvent({ event: 'wibble' });

    expect(logger.error).toHaveBeenCalledTimes(1);
    const args = logger.error.mock.calls[0];
    expect(args).toHaveLength(2);
    expect(args[0]).toBe('log.activityEvent');
    expect(args[1]).toEqual(expect.objectContaining({ data: { event: 'wibble' } }));

    expect(logger.info).not.toHaveBeenCalled();
    expect(logger.debug).not.toHaveBeenCalled();
    expect(logger.critical).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('.activityEvent with missing event', () => {
    log.activityEvent({ uid: 'wibble' });

    expect(logger.error).toHaveBeenCalledTimes(1);
    const args = logger.error.mock.calls[0];
    expect(args).toHaveLength(2);
    expect(args[0]).toBe('log.activityEvent');
    expect(args[1]).toEqual(expect.objectContaining({ data: { uid: 'wibble' } }));

    expect(logger.info).not.toHaveBeenCalled();
    expect(logger.debug).not.toHaveBeenCalled();
    expect(logger.critical).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('.flowEvent', () => {
    log.flowEvent({
      event: 'wibble',
      flow_id: 'blee',
      flow_time: 1000,
      time: 1483557217331,
    });

    expect(logger.info).toHaveBeenCalledTimes(1);
    const args = logger.info.mock.calls[0];
    expect(args).toHaveLength(2);
    expect(args[0]).toBe('flowEvent');
    expect(args[1]).toEqual({
      event: 'wibble',
      flow_id: 'blee',
      flow_time: 1000,
      time: 1483557217331,
    });

    expect(logger.debug).not.toHaveBeenCalled();
    expect(logger.critical).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('.flowEvent with missing data', () => {
    log.flowEvent();

    expect(logger.info).not.toHaveBeenCalled();
    expect(logger.debug).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.critical).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('.flowEvent with missing event', () => {
    log.flowEvent({
      flow_id: 'wibble',
      flow_time: 1000,
      time: 1483557217331,
    });

    expect(logger.info).not.toHaveBeenCalled();
    expect(logger.debug).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.critical).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('.flowEvent with missing flow_id', () => {
    log.flowEvent({
      event: 'wibble',
      flow_time: 1000,
      time: 1483557217331,
    });

    expect(logger.info).not.toHaveBeenCalled();
    expect(logger.debug).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.critical).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('.flowEvent with missing flow_time', () => {
    log.flowEvent({
      event: 'wibble',
      flow_id: 'blee',
      time: 1483557217331,
    });

    expect(logger.info).not.toHaveBeenCalled();
    expect(logger.debug).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.critical).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('.flowEvent with missing time', () => {
    log.flowEvent({
      event: 'wibble',
      flow_id: 'blee',
      flow_time: 1000,
    });

    expect(logger.info).not.toHaveBeenCalled();
    expect(logger.debug).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.critical).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('.error removes PII from error objects', () => {
    const err = new Error() as Error & { email: string | null };
    err.email = 'test@example.com';
    log.error('unexpectedError', { err });

    expect(logger.error).toHaveBeenCalledTimes(1);
    const args = logger.error.mock.calls[0];
    expect(args[0]).toBe('unexpectedError');
    expect(args[1].email).toBe('test@example.com');
    expect(args[1].err.email).toBeNull();
  });

  it('.summary should not log an info message and should still call request.emitRouteFlowEvent', () => {
    const emitRouteFlowEvent = jest.fn();
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
        emitRouteFlowEvent,
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

    expect(logger.info).not.toHaveBeenCalled();

    expect(emitRouteFlowEvent).toHaveBeenCalledTimes(1);
    expect(emitRouteFlowEvent.mock.calls[0]).toHaveLength(1);
    expect(emitRouteFlowEvent.mock.calls[0][0]).toEqual({
      code: 200,
      errno: 109,
      statusCode: 201,
      source: {
        formattedPhoneNumber: 'garply',
      },
    });
    expect(logger.error).not.toHaveBeenCalled();
  });

  describe('traceId', () => {
    it("doesn't set if tracing is not enabled", () => {
      // Re-create log without nodeTracer
      log = require('./log')({
        level: 'debug',
        name: 'test',
        stdout: { on: jest.fn() },
      });

      log.info('op', { uid: 'bloop' });

      expect(logger.info).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalledWith(
        'op',
        expect.objectContaining({ uid: 'bloop' })
      );
    });

    it('should set trace id', () => {
      log = require('./log')({
        level: 'debug',
        name: 'test',
        stdout: { on: jest.fn() },
        nodeTracer: {
          getTraceId: jest.fn().mockReturnValue('fake trace id'),
        },
      });

      log.info('op', { uid: 'bloop' });
      expect(logger.info).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalledWith(
        'op',
        expect.objectContaining({ uid: 'bloop', otelTraceId: 'fake trace id' })
      );

      log.debug('op', { uid: 'bloop' });
      expect(logger.debug).toHaveBeenCalledTimes(1);
      expect(logger.debug).toHaveBeenCalledWith(
        'op',
        expect.objectContaining({ uid: 'bloop', otelTraceId: 'fake trace id' })
      );

      log.error('op', { uid: 'bloop' });
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(
        'op',
        expect.objectContaining({ uid: 'bloop', otelTraceId: 'fake trace id' })
      );
    });
  });

  it('.notifyAttachedServices should send a notification (with service=sync)', async () => {
    const now = 1600000000000;
    jest.spyOn(Date, 'now').mockReturnValue(now);

    const mockGatherMetricsContext = jest.fn().mockResolvedValue({
      time: now,
      entrypoint: 'wibble',
      entrypoint_experiment: undefined,
      entrypoint_variation: undefined,
      flow_id:
        'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
      flow_time: 23,
      flowBeginTime: now - 23,
      flowCompleteSignal: undefined,
      flowType: undefined,
      plan_id: undefined,
      product_id: undefined,
      utm_campaign: 'utm campaign',
      utm_content: 'utm content',
      utm_medium: 'utm medium',
      utm_source: 'utm source',
      utm_term: 'utm term',
    });

    const request = {
      gatherMetricsContext: mockGatherMetricsContext,
    };

    await log.notifyAttachedServices('login', request, {
      service: 'sync',
      ts: now,
    });

    expect(mockGatherMetricsContext).toHaveBeenCalledTimes(1);
    expect(mockNotifierSend).toHaveBeenCalledTimes(1);
    expect(mockNotifierSend.mock.calls[0]).toHaveLength(1);
    expect(mockNotifierSend.mock.calls[0][0]).toEqual({
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
          flow_id:
            'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
          flow_time: 23,
          flowBeginTime: now - 23,
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
  });

  it('.notifyAttachedServices should send a notification (with service=known clientid)', async () => {
    const now = 1600000000000;
    jest.spyOn(Date, 'now').mockReturnValue(now);

    const mockGatherMetricsContext = jest.fn().mockResolvedValue({
      time: now,
      entrypoint: 'wibble',
      entrypoint_experiment: 'blee-experiment',
      entrypoint_variation: 'blee-variation',
      flow_id:
        'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
      flow_time: 23,
      flowBeginTime: now - 23,
      flowCompleteSignal: undefined,
      flowType: undefined,
      plan_id: undefined,
      product_id: undefined,
      utm_campaign: 'utm campaign',
      utm_content: 'utm content',
      utm_medium: 'utm medium',
      utm_source: 'utm source',
      utm_term: 'utm term',
    });

    const request = {
      gatherMetricsContext: mockGatherMetricsContext,
    };

    await log.notifyAttachedServices('login', request, {
      service: '0123456789abcdef',
      ts: now,
    });

    expect(mockGatherMetricsContext).toHaveBeenCalledTimes(1);
    expect(mockNotifierSend).toHaveBeenCalledTimes(1);
    expect(mockNotifierSend.mock.calls[0]).toHaveLength(1);
    expect(mockNotifierSend.mock.calls[0][0]).toEqual({
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
          flow_id:
            'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
          flow_time: 23,
          flowBeginTime: now - 23,
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
  });

  it('.notifyAttachedServices should send a notification (with service=unknown clientid)', async () => {
    const now = 1600000000000;
    jest.spyOn(Date, 'now').mockReturnValue(now);

    const mockGatherMetricsContext = jest.fn().mockResolvedValue({
      time: now,
      entrypoint: 'wibble',
      entrypoint_experiment: undefined,
      entrypoint_variation: undefined,
      flow_id:
        'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
      flow_time: 23,
      flowBeginTime: now - 23,
      flowCompleteSignal: undefined,
      flowType: undefined,
      plan_id: undefined,
      product_id: undefined,
      utm_campaign: 'utm campaign',
      utm_content: 'utm content',
      utm_medium: 'utm medium',
      utm_source: 'utm source',
      utm_term: 'utm term',
    });

    const request = {
      gatherMetricsContext: mockGatherMetricsContext,
    };

    await log.notifyAttachedServices('login', request, {
      service: 'unknown-clientid',
      ts: now,
    });

    expect(mockGatherMetricsContext).toHaveBeenCalledTimes(1);
    expect(mockNotifierSend).toHaveBeenCalledTimes(1);
    expect(mockNotifierSend.mock.calls[0]).toHaveLength(1);
    expect(mockNotifierSend.mock.calls[0][0]).toEqual({
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
          flow_id:
            'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
          flow_time: 23,
          flowBeginTime: now - 23,
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
  });
});
