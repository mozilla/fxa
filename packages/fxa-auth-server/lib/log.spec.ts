/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const logger = {
  debug: jest.fn(),
  error: jest.fn(),
  critical: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

const mockMozlogInstance = jest.fn();
const mockMozlog = jest.fn();

const sentryScope = { setContext: jest.fn() };
const mockSentry = {
  withScope: jest.fn(),
  getActiveSpan: jest.fn(),
};

const mockReportSentryMessage = jest.fn();
const mockValidate = jest.fn();
const mockNotifierSend = jest.fn();
const mockNotifierFactory = jest.fn();
const mockAmplitudeConfig: { schemaValidation: boolean } = {
  schemaValidation: true,
};

jest.mock('mozlog', () => mockMozlog);
jest.mock('@sentry/node', () => mockSentry);
jest.mock('../config', () => ({
  config: {
    get(name: string) {
      switch (name) {
        case 'log':
          return { fmt: 'mozlog' };
        case 'amplitude':
          return mockAmplitudeConfig;
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
jest.mock('./notifier', () => mockNotifierFactory);
jest.mock('./sentry', () => ({
  reportSentryMessage: mockReportSentryMessage,
}));
jest.mock('./oauth/validators', () => ({
  HEX_STRING: /^(?:[0-9a-f]{2})+$/,
}));
jest.mock('fxa-shared', () => ({
  metrics: { amplitude: { validate: mockValidate } },
}));

import logModule from './log';

const validEvent = {
  op: 'amplitudeEvent',
  event_type: 'fxa_activity - access_token_checked',
  time: 1585240759486,
  device_id: '49e7b88cb0e04dc584952e3c500daa53',
  user_id: 'a3333daf1de440b3bcb46745db613bbc',
  app_version: '163.1',
  event_properties: {
    service: 'fxa-settings',
    oauth_client_id: '98e6508e88680e1a',
  },
  user_properties: {
    flow_id: '1ce137da67f8d5a2e5e55fafaca0a14088f015f1d6cdf25400f9fe22226ad5a6',
    ua_browser: 'Firefox',
    ua_version: '76.0',
    $append: {
      account_recovery: false,
      two_step_authentication: false,
      emails: false,
    },
  },
};

// `./log` keeps a module-level `_registered` map of logger names to dedup
// double-init; hand out a unique name per test to avoid spurious warnings.
let nextTestId = 0;
const nextLoggerName = () => `test-${++nextTestId}`;

describe('log', () => {
  let log: any;
  let loggerName: string;

  beforeEach(() => {
    logger.debug.mockReset();
    logger.error.mockReset();
    logger.critical.mockReset();
    logger.warn.mockReset();
    logger.info.mockReset();

    mockMozlogInstance.mockReset().mockReturnValue(logger);
    mockMozlog.mockReset().mockReturnValue(mockMozlogInstance);

    sentryScope.setContext.mockReset();
    mockSentry.withScope
      .mockReset()
      .mockImplementation((cb: (scope: Record<string, jest.Mock>) => void) => {
        cb(sentryScope);
      });
    mockSentry.getActiveSpan.mockReset().mockReturnValue(undefined);

    mockReportSentryMessage.mockReset().mockReturnValue({});
    mockValidate.mockReset();
    mockNotifierSend.mockReset();
    mockNotifierFactory.mockReset().mockReturnValue({ send: mockNotifierSend });
    mockAmplitudeConfig.schemaValidation = true;

    loggerName = nextLoggerName();
    log = logModule({
      level: 'debug',
      name: loggerName,
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
    expect(args[0].app).toBe(loggerName);
    expect(args[0].level).toBe('debug');
    expect(args[0].stream).toBe(process.stderr);

    // mozlog instance was called once with no arguments
    const returnValue = mockMozlog.mock.results[0].value;
    expect(returnValue).toHaveBeenCalledTimes(1);
    expect(returnValue).toHaveBeenCalledWith();

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
    expect(typeof log.amplitudeEvent).toBe('function');
    expect(log.amplitudeEvent.length).toBe(1);
    expect(typeof log.summary).toBe('function');
  });

  it('warns and fixes duplicate logger names', () => {
    const dupName = `${loggerName}-duplicates`;
    const opts = {
      level: 'debug',
      name: dupName,
      stdout: { on: jest.fn() },
    };

    logModule(opts);
    logModule(opts);
    logModule(opts);

    // Edge case: user passes in already incremented name
    logModule({ ...opts, name: `${dupName}-1` });

    // Initial beforeEach call + 4 calls above = 5
    expect(mockMozlog).toHaveBeenCalledTimes(5);
    expect(mockMozlog).toHaveBeenCalledWith(
      expect.objectContaining({ app: loggerName })
    );
    expect(mockMozlog).toHaveBeenCalledWith(
      expect.objectContaining({ app: dupName })
    );
    expect(mockMozlog).toHaveBeenCalledWith(
      expect.objectContaining({ app: `${dupName}-1` })
    );
    expect(mockMozlog).toHaveBeenCalledWith(
      expect.objectContaining({ app: `${dupName}-2` })
    );
    expect(mockMozlog).toHaveBeenCalledWith(
      expect.objectContaining({ app: `${dupName}-1-1` })
    );

    expect(logger.warn).toHaveBeenCalledWith('init', {
      msg: `Logger with name of ${dupName} already registered. Adjusting name to ${dupName}-1 to prevent double log scenario.`,
    });
    expect(logger.warn).toHaveBeenCalledWith('init', {
      msg: `Logger with name of ${dupName} already registered. Adjusting name to ${dupName}-2 to prevent double log scenario.`,
    });
    expect(logger.warn).toHaveBeenCalledWith('init', {
      msg: `Logger with name of ${dupName}-1 already registered. Adjusting name to ${dupName}-1-1 to prevent double log scenario.`,
    });
  });

  it('.activityEvent', () => {
    log.activityEvent({
      event: 'foo',
      uid: 'bar',
    });

    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith('activityEvent', {
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
    expect(logger.error).toHaveBeenCalledWith(
      'log.activityEvent',
      expect.objectContaining({ data: undefined })
    );

    expect(logger.info).not.toHaveBeenCalled();
    expect(logger.debug).not.toHaveBeenCalled();
    expect(logger.critical).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('.activityEvent with missing uid', () => {
    log.activityEvent({ event: 'wibble' });

    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(
      'log.activityEvent',
      expect.objectContaining({ data: { event: 'wibble' } })
    );

    expect(logger.info).not.toHaveBeenCalled();
    expect(logger.debug).not.toHaveBeenCalled();
    expect(logger.critical).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('.activityEvent with missing event', () => {
    log.activityEvent({ uid: 'wibble' });

    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(
      'log.activityEvent',
      expect.objectContaining({ data: { uid: 'wibble' } })
    );

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
    expect(logger.info).toHaveBeenCalledWith('flowEvent', {
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

  it('.amplitudeEvent', () => {
    log.amplitudeEvent(validEvent);

    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith('amplitudeEvent', validEvent);

    expect(logger.debug).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.critical).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('.amplitudeEvent with missing data', () => {
    log.amplitudeEvent();

    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(
      'amplitude.missingData',
      expect.objectContaining({ data: undefined })
    );

    expect(logger.info).not.toHaveBeenCalled();
    expect(logger.debug).not.toHaveBeenCalled();
    expect(logger.critical).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('.amplitudeEvent with missing event_type', () => {
    log.amplitudeEvent({ device_id: 'foo', user_id: 'bar' });

    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(
      'amplitude.missingData',
      expect.objectContaining({
        data: { device_id: 'foo', user_id: 'bar' },
      })
    );

    expect(logger.info).not.toHaveBeenCalled();
    expect(logger.debug).not.toHaveBeenCalled();
    expect(logger.critical).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('.amplitudeEvent with missing device_id and user_id', () => {
    log.amplitudeEvent({ event_type: 'foo' });

    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(
      'amplitude.missingData',
      expect.objectContaining({ data: { event_type: 'foo' } })
    );

    expect(logger.info).not.toHaveBeenCalled();
    expect(logger.debug).not.toHaveBeenCalled();
    expect(logger.critical).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('.amplitudeEvent with missing device_id', () => {
    const event = { ...validEvent, device_id: undefined };
    log.amplitudeEvent(event);

    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith('amplitudeEvent', event);

    expect(logger.debug).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.critical).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('.amplitudeEvent with missing user_id', () => {
    const event = { ...validEvent, user_id: undefined };
    log.amplitudeEvent(event);

    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith('amplitudeEvent', event);

    expect(logger.debug).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.critical).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('.amplitudeEvent does not perform schema validation per configuration', () => {
    mockAmplitudeConfig.schemaValidation = false;
    const event = { ...validEvent, event_type: 'INVALID EVENT TYPE' };
    log.amplitudeEvent(event);

    expect(logger.error).not.toHaveBeenCalled();
    expect(mockSentry.withScope).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith('amplitudeEvent', event);
  });

  it('.amplitudeEvent with invalid data is logged', () => {
    const validationError = new Error(
      'Invalid data: event/event_type must match pattern "^\\w+ - \\w+$"'
    );
    mockValidate.mockImplementation(() => {
      throw validationError;
    });

    const event = { ...validEvent, event_type: 'INVALID EVENT TYPE' };
    log.amplitudeEvent(event);

    // logger.error was called with validation error
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error.mock.calls[0][0]).toBe('amplitude.validationError');
    expect(logger.error.mock.calls[0][1].err.message).toBe(
      'Invalid data: event/event_type must match pattern "^\\w+ - \\w+$"'
    );
    expect(logger.error.mock.calls[0][1].amplitudeEvent).toEqual(event);

    // Sentry withScope was called
    expect(mockSentry.withScope).toHaveBeenCalledTimes(1);
    expect(sentryScope.setContext).toHaveBeenCalledTimes(1);
    expect(sentryScope.setContext.mock.calls[0][0]).toBe(
      'amplitude.validationError'
    );
    expect(sentryScope.setContext.mock.calls[0][1].event_type).toBe(
      'INVALID EVENT TYPE'
    );
    expect(sentryScope.setContext.mock.calls[0][1].flow_id).toBe(
      '1ce137da67f8d5a2e5e55fafaca0a14088f015f1d6cdf25400f9fe22226ad5a6'
    );
    expect(sentryScope.setContext.mock.calls[0][1].error).toBe(
      'Invalid data: event/event_type must match pattern "^\\w+ - \\w+$"'
    );
    expect(mockReportSentryMessage).toHaveBeenCalledTimes(1);
    expect(mockReportSentryMessage).toHaveBeenCalledWith(
      'Amplitude event failed validation',
      'error'
    );

    // Event is still logged despite validation error
    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith('amplitudeEvent', event);
  });

  it('.amplitudeEvent with multiple validation errors', () => {
    const validationError = new Error(
      "Invalid data: event must have required property 'time', event must have required property 'event_properties'"
    );
    mockValidate.mockImplementation(() => {
      throw validationError;
    });

    const event = { ...validEvent };
    delete (event as any).event_properties;
    delete (event as any).time;

    log.amplitudeEvent(event);

    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error.mock.calls[0][0]).toBe('amplitude.validationError');
    expect(logger.error.mock.calls[0][1].err.message).toBe(
      "Invalid data: event must have required property 'time', event must have required property 'event_properties'"
    );
    expect(logger.error.mock.calls[0][1].amplitudeEvent).toEqual(event);

    expect(mockSentry.withScope).toHaveBeenCalledTimes(1);
    expect(sentryScope.setContext).toHaveBeenCalledTimes(1);
    expect(sentryScope.setContext.mock.calls[0][0]).toBe(
      'amplitude.validationError'
    );
    expect(sentryScope.setContext.mock.calls[0][1].error).toBe(
      "Invalid data: event must have required property 'time', event must have required property 'event_properties'"
    );
    expect(mockReportSentryMessage).toHaveBeenCalledTimes(1);
    expect(mockReportSentryMessage).toHaveBeenCalledWith(
      'Amplitude event failed validation',
      'error'
    );

    // Event is still logged
    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith('amplitudeEvent', event);
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
    expect(emitRouteFlowEvent).toHaveBeenCalledWith({
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
      log = logModule({
        level: 'debug',
        name: nextLoggerName(),
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
      log = logModule({
        level: 'debug',
        name: nextLoggerName(),
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
    expect(mockNotifierSend).toHaveBeenCalledWith({
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
    expect(mockNotifierSend).toHaveBeenCalledWith({
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
    expect(mockNotifierSend).toHaveBeenCalledWith({
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
