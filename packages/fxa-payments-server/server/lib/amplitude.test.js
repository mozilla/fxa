/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const pkg = require('../../package.json');
const mockSchemaValidatorFn = jest.fn();
const mockAmplitudeConfig = {
  enabled: true,
  schemaValidation: true,
  rawEvents: false,
};
jest.mock('fxa-shared/metrics/amplitude.js', () => ({
  ...jest.requireActual('fxa-shared/metrics/amplitude.js'),
  validate: mockSchemaValidatorFn,
}));
let scope;
const mockSentry = {
  withScope: jest.fn().mockImplementation((cb) => {
    scope = { setContext: jest.fn() };
    cb(scope);
  }),
  captureMessage: jest.fn(),
};
jest.mock('@sentry/node', () => ({
  ...jest.requireActual('@sentry/node'),
  ...mockSentry,
}));
const Sentry = require('@sentry/node');
const { Container } = require('typedi');
const { StatsD } = require('hot-shots');
const amplitude = require('./amplitude');
const log = require('./logging/log')();
jest.spyOn(log, 'info').mockImplementation(() => {});
jest.spyOn(log, 'error').mockImplementation(() => {});

jest.mock('../config', () => ({
  ...jest.requireActual('../config'),
  get: (key) => {
    switch (key) {
      case 'amplitude':
        return mockAmplitudeConfig;
    }
  },
}));

const mocks = {
  event: {
    offset: 150,
    type: 'amplitude.subPaySetup.view',
  },
  invalidEventType: {
    offset: 150,
    type: 'foo.bar.baz',
  },
  data: {
    version: '148.8',
    deviceId: '0123456789abcdef0123456789abcdef',
    flowBeginTime: 1570000000000,
    flowId: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    flushTime: 9002,
    view: 'product',
  },
  request: {
    headers: {
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:72.0) Gecko/20100101 Firefox/72.0',
    },
  },
};

const expectedOutput = {
  app_version: '148.8',
  device_id: '0123456789abcdef0123456789abcdef',
  event_properties: {},
  event_type: 'fxa_pay_setup - view',
  op: 'amplitudeEvent',
  os_name: 'Mac OS X',
  os_version: '10.14',
  session_id: 1570000000000,
  user_properties: {
    flow_id: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    ua_browser: 'Firefox',
    ua_version: '72.0',
  },
};

describe('lib/amplitude', () => {
  beforeEach(() => {
    log.info.mockClear();
    log.error.mockClear();
    mockSchemaValidatorFn.mockReset();
    mockAmplitudeConfig.schemaValidation = true;
    mockAmplitudeConfig.rawEvents = false;
    Container.set(StatsD, { increment: jest.fn() });
  });
  it('logs a correctly formatted message', () => {
    const statsd = Container.get(StatsD);
    amplitude(mocks.event, mocks.request, mocks.data);
    expect(log.info).toHaveBeenCalledTimes(1);
    expect(log.info.mock.calls[0][0]).toMatch('amplitudeEvent');
    expect(log.info.mock.calls[0][1]).toMatchObject(expectedOutput);
    expect(statsd.increment).toHaveBeenCalledTimes(1);
  });
  it('logs raw events', () => {
    const statsd = Container.get(StatsD);
    const expectedContext = {
      eventSource: 'payments',
      version: pkg.version,
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:72.0) Gecko/20100101 Firefox/72.0',
      deviceId: '0123456789abcdef0123456789abcdef',
      flowBeginTime: 1570000000000,
      flowId:
        '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      lang: 'gd',
    };
    mockAmplitudeConfig.rawEvents = true;
    amplitude(mocks.event, mocks.request, {
      ...mocks.data,
      useless: 'junk',
      lang: 'gd',
    });
    expect(log.info).toHaveBeenCalledTimes(2);
    expect(log.info.mock.calls[0][0]).toMatch('rawAmplitudeData');
    expect(log.info.mock.calls[0][1]).toEqual({
      event: mocks.event,
      context: expectedContext,
    });
    expect(statsd.increment).toHaveBeenCalledTimes(2);
    expect(statsd.increment.mock.calls[0][0]).toBe('amplitude.event.raw');
    expect(statsd.increment.mock.calls[1][0]).toBe('amplitude.event');
  });
  describe('validates inputs', () => {
    it('returns if `event` is missing', () => {
      amplitude(undefined, mocks.request, mocks.data);
      expect(log.info).not.toHaveBeenCalled();
    });
    it('returns if `request` is missing', () => {
      amplitude(mocks.event, undefined, mocks.data);
      expect(log.info).not.toHaveBeenCalled();
    });
    it('returns if `data` is missing', () => {
      amplitude(mocks.event, mocks.request);
      expect(log.info).not.toHaveBeenCalled();
    });
    it('returns if the message format does not match `amplitude.str.str`', () => {
      const statsd = Container.get(StatsD);
      amplitude(mocks.invalidEventType, mocks.request, mocks.data);
      expect(log.info).not.toHaveBeenCalled();
      expect(statsd.increment).toHaveBeenCalledTimes(2);
      expect(statsd.increment.mock.calls[0][0]).toBe('amplitude.event');
      expect(statsd.increment.mock.calls[1][0]).toBe('amplitude.event.dropped');
    });
    it('calls validate to perform schema validation', () => {
      amplitude(mocks.event, mocks.request, mocks.data);
      expect(mockSchemaValidatorFn).toHaveBeenCalledTimes(1);
    });
    it('logs an error when schema validation fails', () => {
      mockSchemaValidatorFn.mockImplementation(() => {
        throw new Error('QUUX IS NOT A VALID DEVICE ID');
      });
      amplitude(mocks.event, mocks.request, {
        ...mocks.data,
        deviceId: 'QUUX',
      });
      expect(mockSchemaValidatorFn).toHaveBeenCalledTimes(1);
      expect(log.error).toHaveBeenCalledTimes(1);
      expect(log.error.mock.calls[0][0]).toBe('amplitude.validationError');
      expect(log.error.mock.calls[0][1]['err']['message']).toBe(
        'QUUX IS NOT A VALID DEVICE ID'
      );
      const expectedEvent = {
        op: 'amplitudeEvent',
        event_type: 'fxa_pay_setup - view',
        device_id: 'QUUX',
        session_id: 1570000000000,
        app_version: '148.8',
        os_name: 'Mac OS X',
        os_version: '10.14',
        event_properties: {},
        user_properties: {
          flow_id:
            '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
          ua_browser: 'Firefox',
          ua_version: '72.0',
        },
      };
      expect(log.error.mock.calls[0][1]['amplitudeEvent']).toEqual(
        expectedEvent
      );
      expect(mockSentry.withScope).toHaveBeenCalledTimes(1);
      expect(scope.setContext).toHaveBeenCalledTimes(1);
      expect(scope.setContext.mock.calls[0][0]).toBe(
        'amplitude.validationError'
      );
      expect(scope.setContext.mock.calls[0][1]['event_type']).toBe(
        'fxa_pay_setup - view'
      );
      expect(scope.setContext.mock.calls[0][1]['flow_id']).toBe(
        '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
      );
      expect(scope.setContext.mock.calls[0][1]['error']).toBe(
        'QUUX IS NOT A VALID DEVICE ID'
      );
      expect(mockSentry.captureMessage).toHaveBeenCalledTimes(1);
      expect(mockSentry.captureMessage).toHaveBeenCalledWith(
        'Amplitude event failed validation: QUUX IS NOT A VALID DEVICE ID.',
        Sentry.Severity.Error
      );
      expect(log.info).toHaveBeenCalledTimes(1);
    });
  });
  describe('responds to configuration', () => {
    it('does not perform validation when config flag is set to false', () => {
      mockAmplitudeConfig.schemaValidation = false;
      amplitude(mocks.event, mocks.request, mocks.data);
      expect(mockSchemaValidatorFn).not.toHaveBeenCalled();
    });
  });
});
