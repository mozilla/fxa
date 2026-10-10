/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const mockInitTracing = jest.fn().mockReturnValue({});
const mockInitSentry = jest.fn();
const mockIgnoreErrors = jest.fn();
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  trace: jest.fn(),
};
const mockLog = jest.fn().mockReturnValue(mockLogger);
const mockHapiIntegration = jest.fn().mockReturnValue({ name: 'Hapi' });
const mockLinkedErrorsIntegration = jest
  .fn()
  .mockReturnValue({ name: 'LinkedErrors' });

jest.mock('@fxa/shared/otel', () => ({
  initTracing: mockInitTracing,
}));
jest.mock('fxa-shared/sentry/node', () => ({
  initSentry: mockInitSentry,
}));
jest.mock('../config', () => ({
  config: {
    getProperties: jest.fn().mockReturnValue({
      log: { level: 'debug' },
      sentry: { dsn: 'https://test@sentry.io/123' },
      tracing: { serviceName: 'fxa-auth-server' },
    }),
  },
}));
jest.mock('./log', () => mockLog);
jest.mock('../package.json', () => ({ version: '1.234.0' }), {
  virtual: true,
});
jest.mock('@fxa/accounts/errors', () => ({
  ignoreErrors: mockIgnoreErrors,
}));
jest.mock('@sentry/node', () => ({
  hapiIntegration: mockHapiIntegration,
  linkedErrorsIntegration: mockLinkedErrorsIntegration,
}));

// Importing the module triggers the top-level init calls once.
import './monitoring';

// Snapshot one-shot call args before `clearMocks: true` wipes them
// between tests; the module-load side-effect can't be replayed.
const initTracingCalls = mockInitTracing.mock.calls.map((c) => [...c]);
const initSentryCalls = mockInitSentry.mock.calls.map((c) => [...c]);
const initSentryConfig = initSentryCalls[0]?.[0];
const tracingCallOrder = mockInitTracing.mock.invocationCallOrder[0];
const sentryCallOrder = mockInitSentry.mock.invocationCallOrder[0];
const hapiIntegrationCallCount = mockHapiIntegration.mock.calls.length;
const linkedErrorsIntegrationCalls = mockLinkedErrorsIntegration.mock.calls.map(
  (c) => c[0]
);
const logCalls = mockLog.mock.calls.map((c) => [...c]);
const filterSentryEvent: (event: any, hint?: any) => any =
  initSentryConfig.eventFilters[0];

describe('monitoring', () => {
  beforeEach(() => {
    mockIgnoreErrors.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('initializes tracing before sentry on module load', () => {
    expect(initTracingCalls).toHaveLength(1);
    expect(initSentryCalls).toHaveLength(1);
    expect(tracingCallOrder).toBeLessThan(sentryCallOrder);

    // Both get the return value of the mocked log(level, name)
    expect(initTracingCalls[0][1]).toBe(mockLogger);
    expect(initSentryCalls[0][1]).toBe(mockLogger);
    expect(logCalls).toContainEqual(['debug', 'configure-sentry']);
  });

  it('cross-wires the sentry and otel flags', () => {
    // A sentry dsn tells otel that sentry is present...
    expect(initTracingCalls[0][0]).toEqual({
      serviceName: 'fxa-auth-server',
      sentry: { enabled: true },
    });
    // ...and a live tracer tells sentry to skip its own otel setup.
    expect(initSentryConfig.sentry.skipOpenTelemetrySetup).toBe(true);
  });

  it('passes the spread config, release, eventFilters and integrations', () => {
    expect(initSentryConfig).toEqual(
      expect.objectContaining({
        log: { level: 'debug' },
        release: '1.234.0',
      })
    );
    expect(initSentryConfig.eventFilters).toHaveLength(1);
    expect(typeof initSentryConfig.eventFilters[0]).toBe('function');
    expect(initSentryConfig.integrations).toHaveLength(2);
  });

  it('passes Sentry integrations with correct configuration', () => {
    expect(hapiIntegrationCallCount).toBe(1);
    expect(linkedErrorsIntegrationCalls).toContainEqual({
      key: 'jse_cause',
    });
  });

  describe('filterSentryEvent', () => {
    it('returns null when ignoreErrors returns true', () => {
      mockIgnoreErrors.mockReturnValue(true);

      const event = { event_id: 'abc123' };
      const hint = { originalException: new Error('ignored error') };

      const result = filterSentryEvent(event, hint);

      expect(result).toBeNull();
      expect(mockIgnoreErrors).toHaveBeenCalledWith(hint.originalException);
    });

    it('returns the event when ignoreErrors returns false', () => {
      mockIgnoreErrors.mockReturnValue(false);

      const event = { event_id: 'def456' };
      const hint = { originalException: new Error('real error') };

      const result = filterSentryEvent(event, hint);

      expect(result).toBe(event);
      expect(mockIgnoreErrors).toHaveBeenCalledWith(hint.originalException);
    });

    it('returns the event when hint.originalException is null', () => {
      const event = { event_id: 'ghi789' };
      const hint = { originalException: null };

      const result = filterSentryEvent(event, hint);

      expect(result).toBe(event);
      expect(mockIgnoreErrors).not.toHaveBeenCalled();
    });

    it('returns the event when hint.originalException is undefined', () => {
      const event = { event_id: 'jkl012' };
      const hint = { originalException: undefined };

      const result = filterSentryEvent(event, hint);

      expect(result).toBe(event);
      expect(mockIgnoreErrors).not.toHaveBeenCalled();
    });

    it('returns the event when hint is undefined', () => {
      const event = { event_id: 'mno345' };

      const result = filterSentryEvent(event, undefined);

      expect(result).toBe(event);
      expect(mockIgnoreErrors).not.toHaveBeenCalled();
    });

    it('returns the event when hint is null', () => {
      const event = { event_id: 'pqr678' };

      const result = filterSentryEvent(event, null);

      expect(result).toBe(event);
      expect(mockIgnoreErrors).not.toHaveBeenCalled();
    });
  });
});
