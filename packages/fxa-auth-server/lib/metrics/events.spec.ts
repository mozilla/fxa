/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


jest.mock('fxa-shared/db/models/auth', () => ({
  Account: { metricsEnabled: jest.fn().mockResolvedValue(true) },
}));

const log = {
  activityEvent: jest.fn(),
  error: jest.fn(),
  flowEvent: jest.fn(),
  info: jest.fn(),
  trace: jest.fn(),
};

const mocks = require('../../test/mocks');
const glean = mocks.mockGlean();

const eventsModule = require('./events');

const events = eventsModule(
  log,
  {
    oauth: {
      clientIds: {},
    },
    verificationReminders: {},
  },
  glean
);

describe('metrics/events', () => {
  beforeEach(() => {
    glean.login.complete.reset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    log.activityEvent.mockClear();
    log.error.mockClear();
    log.flowEvent.mockClear();
    log.trace.mockClear();
  });

  it('interface is correct', () => {
    expect(typeof events).toBe('object');
    expect(events).not.toBeNull();
    expect(Object.keys(events).length).toBe(2);

    expect(typeof events.emit).toBe('function');
    expect(events.emit.length).toBe(2);

    expect(typeof events.emitRouteFlowEvent).toBe('function');
    expect(events.emitRouteFlowEvent.length).toBe(1);

    expect(log.activityEvent).not.toHaveBeenCalled();
    expect(log.flowEvent).not.toHaveBeenCalled();
  });

  it('.emit with missing event', async () => {
    const metricsContext = mocks.mockMetricsContext();
    const request = mocks.mockRequest({ metricsContext });
    await events.emit.call(request, '', {});

    expect(log.error).toHaveBeenCalledTimes(1);
    const args = log.error.mock.calls[0];
    expect(args).toHaveLength(2);
    expect(args[0]).toBe('metricsEvents.emit');
    expect(args[1]).toEqual({ missingEvent: true });

    expect(log.activityEvent).not.toHaveBeenCalled();

    expect(metricsContext.gather.callCount).toBe(0);
    expect(log.flowEvent).not.toHaveBeenCalled();
    expect(metricsContext.clear.callCount).toBe(0);
  });

  it('.emit with activity event', async () => {
    const metricsContext = mocks.mockMetricsContext();
    const request = mocks.mockRequest({
      headers: {
        'user-agent': 'foo',
        'x-sigsci-requestid': 'test-sigsci-id',
        'client-ja4': 'test-ja4',
      },
      metricsContext,
      query: {
        service: 'bar',
      },
    });
    const data = {
      uid: 'baz',
    };
    await events.emit.call(request, 'device.created', data);

    expect(log.activityEvent).toHaveBeenCalledTimes(1);
    let args = log.activityEvent.mock.calls[0];
    expect(args).toHaveLength(1);
    expect(args[0]).toEqual({
      country: 'United States',
      event: 'device.created',
      region: 'California',
      userAgent: 'foo',
      service: 'bar',
      uid: 'baz',
      sigsciRequestId: 'test-sigsci-id',
      clientJa4: 'test-ja4',
    });

    expect(metricsContext.gather.callCount).toBe(1);
    args = metricsContext.gather.args[0];
    expect(args).toHaveLength(1);
    expect(args[0]).toEqual({});


    expect(log.flowEvent).not.toHaveBeenCalled();
    expect(metricsContext.clear.callCount).toBe(0);
    expect(log.error).not.toHaveBeenCalled();
  });

  it('.emit with activity event and missing data', async () => {
    const metricsContext = mocks.mockMetricsContext();
    const request = mocks.mockRequest({
      metricsContext,
      payload: {
        service: 'bar',
      },
    });
    await events.emit.call(request, 'device.created');

    expect(log.activityEvent).toHaveBeenCalledTimes(1);
    const args = log.activityEvent.mock.calls[0];
    expect(args).toHaveLength(1);
    expect(args[0]).toEqual({
      country: 'United States',
      event: 'device.created',
      region: 'California',
      userAgent: 'test user-agent',
      service: 'bar',
      sigsciRequestId: 'test-sigsci-id',
      clientJa4: 'test-ja4',
    });

    expect(metricsContext.gather.callCount).toBe(1);


    expect(log.flowEvent).not.toHaveBeenCalled();
    expect(metricsContext.clear.callCount).toBe(0);
    expect(log.error).not.toHaveBeenCalled();
  });

  it('.emit with activity event and missing uid', async () => {
    const metricsContext = mocks.mockMetricsContext();
    const request = mocks.mockRequest({ metricsContext });
    await events.emit.call(request, 'device.created', {});

    expect(log.activityEvent).toHaveBeenCalledTimes(1);
    const args = log.activityEvent.mock.calls[0];
    expect(args).toHaveLength(1);
    expect(args[0]).toEqual({
      country: 'United States',
      event: 'device.created',
      region: 'California',
      service: undefined,
      userAgent: 'test user-agent',
      sigsciRequestId: 'test-sigsci-id',
      clientJa4: 'test-ja4',
    });

    expect(metricsContext.gather.callCount).toBe(1);


    expect(log.flowEvent).not.toHaveBeenCalled();
    expect(metricsContext.clear.callCount).toBe(0);
    expect(log.error).not.toHaveBeenCalled();
  });

  it('.emit with flow event', async () => {
    const time = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(time);
    const metricsContext = mocks.mockMetricsContext();
    const request = mocks.mockRequest({
      credentials: {
        uid: 'deadbeef',
      },
      metricsContext,
      payload: {
        metricsContext: {
          entrypoint: 'wibble',
          entrypointExperiment: 'exp',
          entrypointVariation: 'var',
          flowId: 'bar',
          flowBeginTime: time - 1000,
          flowCompleteSignal: 'account.signed',
          planId: 'planId',
          productId: 'productId',
          utmCampaign: 'utm campaign',
          utmContent: 'utm content',
          utmMedium: 'utm medium',
          utmSource: 'utm source',
          utmTerm: 'utm term',
        },
        service: 'baz',
      },
    });
    await events.emit.call(request, 'email.verification.sent');

    expect(metricsContext.gather.callCount).toBe(1);
    let args = metricsContext.gather.args[0];
    expect(args).toHaveLength(1);
    expect(args[0].event).toBe('email.verification.sent');
    expect(args[0].locale).toBe(request.app.locale);
    expect(args[0].userAgent).toBe(request.headers['user-agent']);

    expect(log.flowEvent).toHaveBeenCalledTimes(1);
    args = log.flowEvent.mock.calls[0];
    expect(args).toHaveLength(1);
    expect(args[0]).toEqual({
      country: 'United States',
      event: 'email.verification.sent',
      entrypoint: 'wibble',
      entrypoint_experiment: 'exp',
      entrypoint_variation: 'var',
      flow_id: 'bar',
      flow_time: 1000,
      flowBeginTime: time - 1000,
      flowCompleteSignal: 'account.signed',
      flowType: undefined,
      locale: 'en-US',
      plan_id: 'planId',
      product_id: 'productId',
      region: 'California',
      time,
      uid: 'deadbeef',
      userAgent: 'test user-agent',
      utm_campaign: 'utm campaign',
      utm_content: 'utm content',
      utm_medium: 'utm medium',
      utm_source: 'utm source',
      utm_term: 'utm term',
      sigsciRequestId: 'test-sigsci-id',
      clientJa4: 'test-ja4',
    });

    expect(log.activityEvent).not.toHaveBeenCalled();

    expect(metricsContext.clear.callCount).toBe(0);
    expect(log.error).not.toHaveBeenCalled();
  });

  it('.emit with flow event and no session token', async () => {
    const time = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(time);
    const metricsContext = mocks.mockMetricsContext();
    const request = {
      app: {
        devices: Promise.resolve(),
        geo: {
          location: {
            country: 'United Kingdom',
            state: 'Dorset',
          },
        },
        locale: 'en',
        ua: {},
        isMetricsEnabled: Promise.resolve(true),
      },
      auth: null,
      clearMetricsContext: metricsContext.clear,
      gatherMetricsContext: metricsContext.gather,
      headers: {
        dnt: '1',
        'user-agent': 'foo',
        'x-sigsci-requestid': 'test-sigsci-id',
        'client-ja4': 'test-ja4',
      },
      payload: {
        metricsContext: {
          flowId: 'bar',
          flowBeginTime: time - 1000,
          flowCompleteSignal: 'account.signed',
        },
      },
    };
    await events.emit.call(request, 'email.verification.sent');

    expect(metricsContext.gather.callCount).toBe(1);

    expect(log.flowEvent).toHaveBeenCalledTimes(1);
    const args = log.flowEvent.mock.calls[0];
    expect(args).toHaveLength(1);
    expect(args[0]).toEqual({
      country: 'United Kingdom',
      event: 'email.verification.sent',
      flow_id: 'bar',
      flow_time: 1000,
      flowBeginTime: time - 1000,
      flowCompleteSignal: 'account.signed',
      flowType: undefined,
      locale: 'en',
      region: 'Dorset',
      time,
      userAgent: 'foo',
      sigsciRequestId: 'test-sigsci-id',
      clientJa4: 'test-ja4',
    });

    expect(log.activityEvent).not.toHaveBeenCalled();

    expect(metricsContext.clear.callCount).toBe(0);
    expect(log.error).not.toHaveBeenCalled();
  });

  it('.emit with flow event and string uid', async () => {
    const time = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(time);
    const metricsContext = mocks.mockMetricsContext();
    const request = mocks.mockRequest({
      headers: {
        dnt: '1',
        'user-agent': 'test user-agent',
        'x-sigsci-requestid': 'test-sigsci-id',
        'client-ja4': 'test-ja4',
      },
      metricsContext,
      payload: {
        metricsContext: {
          flowId: 'bar',
          flowBeginTime: time - 1000,
          flowCompleteSignal: 'account.signed',
        },
      },
    });
    await events.emit.call(request, 'email.verification.sent', {
      uid: 'deadbeef',
    });

    expect(metricsContext.gather.callCount).toBe(1);

    expect(log.flowEvent).toHaveBeenCalledTimes(1);
    const args = log.flowEvent.mock.calls[0];
    expect(args).toHaveLength(1);
    expect(args[0]).toEqual({
      country: 'United States',
      event: 'email.verification.sent',
      flow_id: 'bar',
      flow_time: 1000,
      flowBeginTime: time - 1000,
      flowCompleteSignal: 'account.signed',
      flowType: undefined,
      locale: 'en-US',
      region: 'California',
      time,
      uid: 'deadbeef',
      userAgent: 'test user-agent',
      sigsciRequestId: 'test-sigsci-id',
      clientJa4: 'test-ja4',
    });

    expect(log.activityEvent).not.toHaveBeenCalled();

    expect(metricsContext.clear.callCount).toBe(0);
    expect(log.error).not.toHaveBeenCalled();
  });

  it('.emit with flow event and buffer uid', async () => {
    const time = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(time);
    const metricsContext = mocks.mockMetricsContext();
    const request = mocks.mockRequest({
      headers: {
        dnt: '1',
        'user-agent': 'test user-agent',
        'x-sigsci-requestid': 'test-sigsci-id',
        'client-ja4': 'test-ja4',
      },
      metricsContext,
      payload: {
        metricsContext: {
          flowId: 'bar',
          flowBeginTime: time - 1000,
          flowCompleteSignal: 'account.signed',
        },
      },
    });
    await events.emit.call(request, 'email.verification.sent', {
      uid: 'deadbeef',
    });

    expect(metricsContext.gather.callCount).toBe(1);

    expect(log.flowEvent).toHaveBeenCalledTimes(1);
    const args = log.flowEvent.mock.calls[0];
    expect(args).toHaveLength(1);
    expect(args[0]).toEqual({
      country: 'United States',
      event: 'email.verification.sent',
      flow_id: 'bar',
      flow_time: 1000,
      flowBeginTime: time - 1000,
      flowCompleteSignal: 'account.signed',
      flowType: undefined,
      locale: 'en-US',
      region: 'California',
      time,
      uid: 'deadbeef',
      userAgent: 'test user-agent',
      sigsciRequestId: 'test-sigsci-id',
      clientJa4: 'test-ja4',
    });

    expect(log.activityEvent).not.toHaveBeenCalled();

    expect(metricsContext.clear.callCount).toBe(0);
    expect(log.error).not.toHaveBeenCalled();
  });

  it('.emit with flow event and null uid', async () => {
    const time = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(time);
    const metricsContext = mocks.mockMetricsContext();
    const request = mocks.mockRequest({
      headers: {
        dnt: '1',
        'user-agent': 'test user-agent',
        'x-sigsci-requestid': 'test-sigsci-id',
        'client-ja4': 'test-ja4',
      },
      metricsContext,
      payload: {
        metricsContext: {
          flowId: 'bar',
          flowBeginTime: time - 1000,
          flowCompleteSignal: 'account.signed',
        },
      },
    });
    await events.emit.call(request, 'email.verification.sent', { uid: null });

    expect(metricsContext.gather.callCount).toBe(1);

    expect(log.flowEvent).toHaveBeenCalledTimes(1);
    const args = log.flowEvent.mock.calls[0];
    expect(args).toHaveLength(1);
    expect(args[0]).toEqual({
      country: 'United States',
      event: 'email.verification.sent',
      flow_id: 'bar',
      flow_time: 1000,
      flowBeginTime: time - 1000,
      flowCompleteSignal: 'account.signed',
      flowType: undefined,
      locale: 'en-US',
      region: 'California',
      time,
      userAgent: 'test user-agent',
      sigsciRequestId: 'test-sigsci-id',
      clientJa4: 'test-ja4',
    });

    expect(log.activityEvent).not.toHaveBeenCalled();

    expect(metricsContext.clear.callCount).toBe(0);
    expect(log.error).not.toHaveBeenCalled();
  });

  it('.emit with flow event that matches complete signal', async () => {
    const time = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(time);
    const metricsContext = mocks.mockMetricsContext();
    const request = mocks.mockRequest({
      headers: {
        dnt: '1',
        'user-agent': 'test user-agent',
        'x-sigsci-requestid': 'test-sigsci-id',
        'client-ja4': 'test-ja4',
      },
      locale: 'fr',
      metricsContext,
      payload: {
        metricsContext: {
          flowId: 'bar',
          flowBeginTime: time - 2000,
          flowCompleteSignal: 'email.verification.sent',
          flowType: 'registration',
        },
      },
    });
    await events.emit.call(request, 'email.verification.sent', {
      locale: 'baz',
      uid: 'qux',
    });

    expect(metricsContext.gather.callCount).toBe(1);

    expect(log.flowEvent).toHaveBeenCalledTimes(2);
    expect(log.flowEvent.mock.calls[0][0]).toEqual({
      country: 'United States',
      event: 'email.verification.sent',
      flow_id: 'bar',
      flow_time: 2000,
      flowBeginTime: time - 2000,
      flowCompleteSignal: 'email.verification.sent',
      flowType: 'registration',
      locale: 'fr',
      region: 'California',
      time,
      uid: 'qux',
      userAgent: 'test user-agent',
      sigsciRequestId: 'test-sigsci-id',
      clientJa4: 'test-ja4',
    });
    expect(log.flowEvent.mock.calls[1][0]).toEqual({
      country: 'United States',
      event: 'flow.complete',
      flow_id: 'bar',
      flow_time: 2000,
      flowBeginTime: time - 2000,
      flowCompleteSignal: 'email.verification.sent',
      flowType: 'registration',
      locale: 'fr',
      region: 'California',
      time,
      uid: 'qux',
      userAgent: 'test user-agent',
      sigsciRequestId: 'test-sigsci-id',
      clientJa4: 'test-ja4',
    });

    expect(metricsContext.clear.callCount).toBe(1);
    expect(metricsContext.clear.args[0]).toHaveLength(0);

    expect(log.activityEvent).not.toHaveBeenCalled();
    expect(log.error).not.toHaveBeenCalled();
  });

  it('.emit with flow event and missing headers', async () => {
    const metricsContext = mocks.mockMetricsContext();
    const request = {
      app: {
        devices: Promise.resolve(),
        geo: {},
        ua: {},
        isMetricsEnabled: Promise.resolve(true),
      },
      clearMetricsContext: metricsContext.clear,
      gatherMetricsContext: metricsContext.gather,
      payload: {
        metricsContext: {
          flowId: 'foo',
          flowBeginTime: Date.now() - 1,
        },
      },
    };
    await events.emit.call(request, 'email.verification.sent');

    expect(log.trace).toHaveBeenCalledTimes(1);
    const args = log.trace.mock.calls[0];
    expect(args).toHaveLength(2);
    expect(args[0]).toBe('metricsEvents.emitFlowEvent');
    expect(args[1]).toEqual({
      event: 'email.verification.sent',
      badRequest: true,
    });

    expect(metricsContext.gather.callCount).toBe(1);

    expect(log.activityEvent).not.toHaveBeenCalled();

    expect(log.flowEvent).not.toHaveBeenCalled();
    expect(metricsContext.clear.callCount).toBe(0);
  });

  it('.emit with flow event and missing flowId', async () => {
    const metricsContext = mocks.mockMetricsContext();
    const request = mocks.mockRequest({
      metricsContext,
      payload: {
        metricsContext: {
          flowBeginTime: Date.now() - 1,
        },
      },
    });
    await events.emit.call(request, 'email.verification.sent');

    expect(metricsContext.gather.callCount).toBe(1);

    expect(log.error).toHaveBeenCalledTimes(1);
    expect(log.error.mock.calls[0][0]).toBe('metricsEvents.emitFlowEvent');
    expect(log.error.mock.calls[0][1]).toEqual({
      event: 'email.verification.sent',
      missingFlowId: true,
    });

    expect(log.activityEvent).not.toHaveBeenCalled();

    expect(log.flowEvent).not.toHaveBeenCalled();
    expect(metricsContext.clear.callCount).toBe(0);
  });

  it('.emit with hybrid activity/flow event', async () => {
    const time = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(time);
    const metricsContext = mocks.mockMetricsContext();
    const request = mocks.mockRequest({
      headers: {
        dnt: '1',
        'user-agent': 'test user-agent',
        'x-sigsci-requestid': 'test-sigsci-id',
        'client-ja4': 'test-ja4',
      },
      metricsContext,
      payload: {
        metricsContext: {
          flowId: 'bar',
          flowBeginTime: time - 42,
        },
      },
    });
    const data = {
      uid: 'baz',
    };
    await events.emit.call(request, 'account.keyfetch', data);

    expect(log.activityEvent).toHaveBeenCalledTimes(1);
    expect(log.activityEvent.mock.calls[0][0]).toEqual({
      country: 'United States',
      event: 'account.keyfetch',
      region: 'California',
      userAgent: 'test user-agent',
      service: undefined,
      uid: 'baz',
      sigsciRequestId: 'test-sigsci-id',
      clientJa4: 'test-ja4',
    });

    expect(metricsContext.gather.callCount).toBe(1);

    expect(log.flowEvent).toHaveBeenCalledTimes(1);
    expect(log.flowEvent.mock.calls[0][0]).toEqual({
      country: 'United States',
      time,
      event: 'account.keyfetch',
      flow_id: 'bar',
      flow_time: 42,
      flowBeginTime: time - 42,
      flowCompleteSignal: undefined,
      flowType: undefined,
      locale: 'en-US',
      region: 'California',
      uid: 'baz',
      userAgent: 'test user-agent',
      sigsciRequestId: 'test-sigsci-id',
      clientJa4: 'test-ja4',
    });


    expect(metricsContext.clear.callCount).toBe(0);
    expect(log.error).not.toHaveBeenCalled();
  });

  it('.emit with optional flow event and missing flowId', async () => {
    const metricsContext = mocks.mockMetricsContext();
    const request = mocks.mockRequest({
      metricsContext,
      payload: {
        metricsContext: {
          flowBeginTime: Date.now() - 1,
        },
      },
    });
    const data = {
      uid: 'bar',
    };
    await events.emit.call(request, 'account.keyfetch', data);

    expect(log.activityEvent).toHaveBeenCalledTimes(1);
    expect(metricsContext.gather.callCount).toBe(1);


    expect(log.flowEvent).not.toHaveBeenCalled();
    expect(metricsContext.clear.callCount).toBe(0);
    expect(log.error).not.toHaveBeenCalled();
  });

  it('.emit with content-server account.signed event', async () => {
    const sinon = require('sinon');
    const flowBeginTime = Date.now() - 1;
    const metricsContext = mocks.mockMetricsContext({
      gather: sinon.spy(() => ({
        device_id: 'foo',
        flow_id: 'bar',
        flowBeginTime,
      })),
    });
    const request = mocks.mockRequest({
      metricsContext,
      query: {
        service: 'content-server',
      },
    });
    const data = {
      uid: 'baz',
    };
    await events.emit.call(request, 'account.signed', data);

    expect(log.activityEvent).toHaveBeenCalledTimes(1);


    expect(metricsContext.gather.callCount).toBe(1);

    expect(log.flowEvent).not.toHaveBeenCalled();
    expect(metricsContext.clear.callCount).toBe(0);
    expect(log.error).not.toHaveBeenCalled();
  });

  it('.emit with sync account.signed event', async () => {
    const metricsContext = mocks.mockMetricsContext();
    const request = mocks.mockRequest({
      metricsContext,
      payload: {
        metricsContext: {
          flowId: 'bar',
          flowBeginTime: Date.now() - 1,
        },
      },
      query: {
        service: 'sync',
      },
    });
    const data = {
      uid: 'baz',
    };
    await events.emit.call(request, 'account.signed', data);

    expect(log.activityEvent).toHaveBeenCalledTimes(1);
    expect(metricsContext.gather.callCount).toBe(1);
    expect(log.flowEvent).toHaveBeenCalledTimes(1);
    expect(metricsContext.clear.callCount).toBe(0);
    expect(log.error).not.toHaveBeenCalled();
  });

  it('.emit does not log event if isMetricsEnabled is false', async () => {
    const request = mocks.mockRequest({
      isMetricsEnabledValue: false,
    });
    const data = {
      uid: 'baz',
    };
    expect(request.app.metricsEventUid).toBeUndefined();
    await events.emit.call(request, 'account.signed', data);

    expect(request.app.metricsEventUid).toBe(data.uid);

  });

  it('.emit sets metricsEventUid if provided in data', async () => {
    const request = mocks.mockRequest({});
    const data = {
      uid: 'baz',
    };
    expect(request.app.metricsEventUid).toBeUndefined();
    await events.emit.call(request, 'account.signed', data);

    expect(request.app.metricsEventUid).toBe(data.uid);
  });

  it('.emit on login flow complete', async () => {
    const time = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(time);
    const metricsContext = mocks.mockMetricsContext();
    const request = mocks.mockRequest({
      credentials: {
        uid: 'deadbeef',
      },
      metricsContext,
      payload: {
        metricsContext: {
          entrypoint: 'wibble',
          entrypointExperiment: 'exp',
          entrypointVariation: 'var',
          flowId: 'bar',
          flowBeginTime: time - 1000,
          flowCompleteSignal: 'account.signed',
          flowType: 'login',
          planId: 'planId',
          productId: 'productId',
          utmCampaign: 'utm campaign',
          utmContent: 'utm content',
          utmMedium: 'utm medium',
          utmSource: 'utm source',
          utmTerm: 'utm term',
        },
        service: 'baz',
      },
    });
    await events.emit.call(request, 'account.signed', { uid: 'quux' });

    // glean.login.complete is a sinon stub from mockGlean()
    expect(glean.login.complete.calledOnce).toBe(true);
    expect(glean.login.complete.calledWithExactly(request, {
      uid: 'quux',
      reason: 'email',
    })).toBe(true);
  });

  it('.emitRouteFlowEvent with matching route and response.statusCode', async () => {
    const time = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(time);
    const metricsContext = mocks.mockMetricsContext();
    const request = mocks.mockRequest({
      headers: {
        dnt: '1',
        'user-agent': 'test user-agent',
        'x-sigsci-requestid': 'test-sigsci-id',
        'client-ja4': 'test-ja4',
      },
      metricsContext,
      path: '/v1/account/create',
      payload: {
        metricsContext: {
          flowId: 'bar',
          flowBeginTime: time - 1000,
        },
      },
      received: time - 42,
      completed: time,
    });
    await events.emitRouteFlowEvent.call(request, { statusCode: 200 });

    expect(metricsContext.gather.callCount).toBe(1);

    expect(log.flowEvent).toHaveBeenCalledTimes(2);

    let args = log.flowEvent.mock.calls[0];
    expect(args).toHaveLength(1);
    expect(args[0]).toEqual({
      country: 'United States',
      event: 'route./account/create.200',
      flow_id: 'bar',
      flow_time: 1000,
      flowBeginTime: time - 1000,
      flowCompleteSignal: undefined,
      flowType: undefined,
      locale: 'en-US',
      region: 'California',
      time,
      userAgent: 'test user-agent',
      sigsciRequestId: 'test-sigsci-id',
      clientJa4: 'test-ja4',
    });

    args = log.flowEvent.mock.calls[1];
    expect(args).toHaveLength(1);
    expect(args[0]).toEqual({
      country: 'United States',
      event: 'route.performance./account/create',
      flow_id: 'bar',
      flow_time: 42,
      flowBeginTime: time - 1000,
      flowCompleteSignal: undefined,
      flowType: undefined,
      locale: 'en-US',
      region: 'California',
      time,
      userAgent: 'test user-agent',
      sigsciRequestId: 'test-sigsci-id',
      clientJa4: 'test-ja4',
    });

    expect(log.activityEvent).not.toHaveBeenCalled();
    expect(metricsContext.clear.callCount).toBe(0);
    expect(log.error).not.toHaveBeenCalled();
  });

  it('.emitRouteFlowEvent with matching route and response.output.statusCode', async () => {
    const time = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(time);
    const metricsContext = mocks.mockMetricsContext();
    const request = mocks.mockRequest({
      headers: {
        dnt: '1',
        'user-agent': 'test user-agent',
        'x-sigsci-requestid': 'test-sigsci-id',
        'client-ja4': 'test-ja4',
      },
      metricsContext,
      path: '/v1/account/login',
      payload: {
        metricsContext: {
          flowId: 'bar',
          flowBeginTime: time - 1000,
        },
      },
    });
    await events.emitRouteFlowEvent.call(request, {
      output: { statusCode: 399 },
    });

    expect(metricsContext.gather.callCount).toBe(1);

    expect(log.flowEvent).toHaveBeenCalledTimes(1);
    expect(log.flowEvent.mock.calls[0][0]).toEqual({
      country: 'United States',
      event: 'route./account/login.399',
      flow_id: 'bar',
      flow_time: 1000,
      flowBeginTime: time - 1000,
      flowCompleteSignal: undefined,
      flowType: undefined,
      locale: 'en-US',
      region: 'California',
      time,
      userAgent: 'test user-agent',
      sigsciRequestId: 'test-sigsci-id',
      clientJa4: 'test-ja4',
    });

    expect(log.activityEvent).not.toHaveBeenCalled();
    expect(metricsContext.clear.callCount).toBe(0);
    expect(log.error).not.toHaveBeenCalled();
  });

  it('.emitRouteFlowEvent with matching route and 400 statusCode', async () => {
    const time = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(time);
    const metricsContext = mocks.mockMetricsContext();
    const request = mocks.mockRequest({
      headers: {
        dnt: '1',
        'user-agent': 'test user-agent',
        'x-sigsci-requestid': 'test-sigsci-id',
        'client-ja4': 'test-ja4',
      },
      metricsContext,
      path: '/v1/recovery_email/resend_code',
      payload: {
        metricsContext: {
          flowId: 'bar',
          flowBeginTime: time - 1000,
        },
      },
    });
    await events.emitRouteFlowEvent.call(request, { statusCode: 400 });

    expect(metricsContext.gather.callCount).toBe(1);

    expect(log.flowEvent).toHaveBeenCalledTimes(1);
    expect(log.flowEvent.mock.calls[0][0]).toEqual({
      country: 'United States',
      event: 'route./recovery_email/resend_code.400.999',
      flow_id: 'bar',
      flow_time: 1000,
      flowBeginTime: time - 1000,
      flowCompleteSignal: undefined,
      flowType: undefined,
      locale: 'en-US',
      region: 'California',
      time,
      userAgent: 'test user-agent',
      sigsciRequestId: 'test-sigsci-id',
      clientJa4: 'test-ja4',
    });

    expect(log.activityEvent).not.toHaveBeenCalled();
    expect(metricsContext.clear.callCount).toBe(0);
    expect(log.error).not.toHaveBeenCalled();
  });

  it('.emitRouteFlowEvent with matching route and 404 statusCode', async () => {
    const time = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(time);
    const metricsContext = mocks.mockMetricsContext();
    const request = mocks.mockRequest({
      headers: {
        dnt: '1',
        'user-agent': 'test user-agent',
        'x-sigsci-requestid': 'test-sigsci-id',
        'client-ja4': 'test-ja4',
      },
      metricsContext,
      path: '/v1/recovery_email/resend_code',
      payload: {
        metricsContext: {
          flowId: 'bar',
          flowBeginTime: time - 1000,
        },
      },
    });
    await events.emitRouteFlowEvent.call(request, { statusCode: 404 });

    expect(metricsContext.gather.callCount).toBe(0);
    expect(log.flowEvent).not.toHaveBeenCalled();
    expect(log.activityEvent).not.toHaveBeenCalled();
    expect(metricsContext.clear.callCount).toBe(0);
    expect(log.error).not.toHaveBeenCalled();
  });

  it('.emitRouteFlowEvent with matching route and 400 statusCode with errno', async () => {
    const time = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(time);
    const metricsContext = mocks.mockMetricsContext();
    const request = mocks.mockRequest({
      headers: {
        dnt: '1',
        'user-agent': 'test user-agent',
        'x-sigsci-requestid': 'test-sigsci-id',
        'client-ja4': 'test-ja4',
      },
      metricsContext,
      path: '/v1/account/destroy',
      payload: {
        metricsContext: {
          flowId: 'bar',
          flowBeginTime: time - 1000,
        },
      },
    });
    await events.emitRouteFlowEvent.call(request, {
      statusCode: 400,
      errno: 42,
    });

    expect(metricsContext.gather.callCount).toBe(1);

    expect(log.flowEvent).toHaveBeenCalledTimes(1);
    expect(log.flowEvent.mock.calls[0][0]).toEqual({
      country: 'United States',
      event: 'route./account/destroy.400.42',
      flow_id: 'bar',
      flow_time: 1000,
      flowBeginTime: time - 1000,
      flowCompleteSignal: undefined,
      flowType: undefined,
      locale: 'en-US',
      region: 'California',
      time,
      userAgent: 'test user-agent',
      sigsciRequestId: 'test-sigsci-id',
      clientJa4: 'test-ja4',
    });

    expect(log.activityEvent).not.toHaveBeenCalled();
    expect(metricsContext.clear.callCount).toBe(0);
    expect(log.error).not.toHaveBeenCalled();
  });

  it.each([
    '/account/devices',
    '/account/profile',
    '/account/sessions',
    '/password/forgot/status',
    '/recovery_email/status',
    '/recoveryKey/0123456789abcdef0123456789ABCDEF',
  ])('.emitRouteFlowEvent with %s', async (route) => {
    const metricsContext = mocks.mockMetricsContext();
    const request = mocks.mockRequest({
      metricsContext,
      path: `/v1${route}`,
      payload: {
        metricsContext: {
          flowId: 'bar',
          flowBeginTime: Date.now() - 1000,
        },
      },
    });
    await events.emitRouteFlowEvent.call(request, { statusCode: 200 });

    expect(metricsContext.gather.callCount).toBe(0);
    expect(log.flowEvent).not.toHaveBeenCalled();
    expect(log.activityEvent).not.toHaveBeenCalled();
    expect(metricsContext.clear.callCount).toBe(0);
    expect(log.error).not.toHaveBeenCalled();
  });

  it('.emitRouteFlowEvent with matching route and invalid metrics context', async () => {
    const sinon = require('sinon');
    const metricsContext = mocks.mockMetricsContext({
      validate: sinon.spy(() => false),
    });
    const request = mocks.mockRequest({
      metricsContext,
      path: '/v1/account/destroy',
      payload: {
        metricsContext: {
          flowId: 'bar',
          flowBeginTime: Date.now(),
        },
      },
    });
    await events.emitRouteFlowEvent.call(request, {
      statusCode: 400,
      errno: 107,
    });

    expect(metricsContext.validate.callCount).toBe(1);
    expect(metricsContext.validate.args[0]).toHaveLength(0);

    expect(metricsContext.gather.callCount).toBe(0);
    expect(log.flowEvent).not.toHaveBeenCalled();
    expect(log.activityEvent).not.toHaveBeenCalled();
    expect(metricsContext.clear.callCount).toBe(0);
    expect(log.error).not.toHaveBeenCalled();
  });

  it('.emitRouteFlowEvent with missing parameter error but valid metrics context', async () => {
    const metricsContext = mocks.mockMetricsContext();
    const request = mocks.mockRequest({
      metricsContext,
      path: '/v1/account/destroy',
      payload: {
        metricsContext: {
          flowId: 'bar',
          flowBeginTime: Date.now(),
        },
      },
    });
    await events.emitRouteFlowEvent.call(request, {
      statusCode: 400,
      errno: 107,
    });

    expect(metricsContext.validate.callCount).toBe(1);
    expect(metricsContext.gather.callCount).toBe(1);
    expect(log.flowEvent).toHaveBeenCalledTimes(1);

    expect(log.activityEvent).not.toHaveBeenCalled();
    expect(metricsContext.clear.callCount).toBe(0);
    expect(log.error).not.toHaveBeenCalled();
  });
});
