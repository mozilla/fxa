/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


describe('monitoring', () => {
  let mockInitMonitoring: jest.Mock;
  let mockIgnoreErrors: jest.Mock;
  let mockLog: jest.Mock;
  let mockLogger: Record<string, jest.Mock>;
  let mockHapiIntegration: jest.Mock;
  let mockLinkedErrorsIntegration: jest.Mock;

  beforeEach(() => {
    jest.resetModules();

    mockInitMonitoring = jest.fn();
    mockIgnoreErrors = jest.fn();
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
    };
    mockLog = jest.fn().mockReturnValue(mockLogger);
    mockHapiIntegration = jest.fn().mockReturnValue({ name: 'Hapi' });
    mockLinkedErrorsIntegration = jest
      .fn()
      .mockReturnValue({ name: 'LinkedErrors' });

    jest.doMock('fxa-shared/monitoring', () => ({
      initMonitoring: mockInitMonitoring,
    }));
    jest.doMock('../config', () => ({
      config: {
        getProperties: jest.fn().mockReturnValue({
          log: { level: 'debug' },
          sentry: { dsn: 'https://test@sentry.io/123' },
        }),
      },
    }));
    jest.doMock('./log', () => mockLog);
    jest.doMock('../package.json', () => ({ version: '1.234.0' }), {
      virtual: true,
    });
    jest.doMock('@fxa/accounts/errors', () => ({
      ignoreErrors: mockIgnoreErrors,
    }));
    jest.doMock('@sentry/node', () => ({
      hapiIntegration: mockHapiIntegration,
      linkedErrorsIntegration: mockLinkedErrorsIntegration,
    }));

    // Requiring the module triggers the top-level initMonitoring() call.
    require('./monitoring');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls initMonitoring on module load', () => {
    expect(mockInitMonitoring).toHaveBeenCalledTimes(1);

    const callArg = mockInitMonitoring.mock.calls[0][0];

    // Logger is the return value of require('./log')(level, name)
    expect(callArg.logger).toBe(mockLogger);
    expect(mockLog).toHaveBeenCalledWith('debug', 'configure-sentry');

    // Config includes spread properties, release, eventFilters, integrations
    expect(callArg.config).toEqual(
      expect.objectContaining({
        log: { level: 'debug' },
        sentry: { dsn: 'https://test@sentry.io/123' },
        release: '1.234.0',
      })
    );
    expect(callArg.config.eventFilters).toHaveLength(1);
    expect(typeof callArg.config.eventFilters[0]).toBe('function');
    expect(callArg.config.integrations).toHaveLength(2);
  });

  it('passes Sentry integrations with correct configuration', () => {
    expect(mockHapiIntegration).toHaveBeenCalledTimes(1);
    expect(mockLinkedErrorsIntegration).toHaveBeenCalledWith({
      key: 'jse_cause',
    });
  });

  describe('filterSentryEvent', () => {
    let filterSentryEvent: (event: any, hint?: any) => any;

    beforeEach(() => {
      // Extract the filterSentryEvent function from the initMonitoring call
      const callArg = mockInitMonitoring.mock.calls[0][0];
      filterSentryEvent = callArg.config.eventFilters[0];
    });

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
