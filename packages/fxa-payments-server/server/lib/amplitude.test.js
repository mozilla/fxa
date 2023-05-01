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
const mockGeoDBConfig = {
  enabled: true,
};
// TODO: move these into the `mocks` object.
const mockClientAddressDepthConfig = 0;
const mockRemoteAddress = {
  addresses: [],
  clientAddress: '127.0.0.1',
};
const mockLocation = {
  countryCode: 'DE',
};
const mockOAuthClientIdMap = {
  dcdb5ae7add825d2: '123done',
};
jest.mock('fxa-shared/metrics/amplitude', () => ({
  amplitude: {
    ...jest.requireActual('fxa-shared/metrics/amplitude').amplitude,
    validate: mockSchemaValidatorFn,
  },
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
jest.mock('../config', () => ({
  ...jest.requireActual('../config'),
  get: (key) => {
    switch (key) {
      case 'amplitude':
        return mockAmplitudeConfig;
      case 'geodb':
        return mockGeoDBConfig;
      case 'clientAddressDepth':
        return mockClientAddressDepthConfig;
      case 'oauth_client_id_map':
        return mockOAuthClientIdMap;
      default:
    }
  },
}));
jest.mock('fxa-geodb', () => {
  return () => {};
});
jest.mock('fxa-shared/express/remote-address', () => ({
  remoteAddress: () => () => {
    return mockRemoteAddress;
  },
}));
jest.mock('fxa-shared/express/geo-locate', () => ({
  geolocate: () => () => () => () => {
    return mockLocation;
  },
}));
const { amplitude, getLocation, getCountryCode } = require('./amplitude');
const log = require('./logging/log')();
jest.spyOn(log, 'info').mockImplementation(() => {});
jest.spyOn(log, 'error').mockImplementation(() => {});

const mockRequest = {
  body: {
    events: [
      {
        offset: 182161,
        type: 'amplitude.subPaySetup.view',
        time: 1682959697295,
      },
    ],
    data: {
      flushTime: 1682959697295,
      deviceId: '4bd85d4d2b2d4dbf8d8008731300d08b',
      flowBeginTime: 1682959515134,
      flowId:
        '513dce8ac5b03b04e1af1a2c2f07e8a53e70064950b8a664327e6791b6273eb2',
      planId: 'plan_GqM9N6qyhvxaVk',
      productId: 'prod_GqM9ToKK62qjkK',
      device_id: '4bd85d4d2b2d4dbf8d8008731300d08b',
      flow_begin_time: '1682959515134',
      flow_id:
        '513dce8ac5b03b04e1af1a2c2f07e8a53e70064950b8a664327e6791b6273eb2',
      plan: 'plan_GqM9N6qyhvxaVk',
      service: 'dcdb5ae7add825d2',
      entrypoint: 'www.mozilla.org-vpn-product-page',
      form_type: 'button',
      utm_campaign: 'vpn-product-page',
      utm_medium: 'referral',
      utm_source: 'www.mozilla.org-vpn-product-page',
      data_cta_position: 'pricing',
      amount: 500,
      currency: 'usd',
      interval_count: 1,
      interval: 'month',
      plan_metadata: {
        productOrder: '1',
      },
      plan_name: '123Done Pro Monthly',
      product_metadata: {
        emailIconURL:
          'https://123done-stage.dev.lcip.org/img/transparent-logo.png',
        playSkuIds:
          'org.mozilla.sarah.vpn.yearly,org.mozilla.sarah.vpn.monthly',
        'product:privacyNoticeDownloadURL':
          'https://accounts-static.cdn.mozilla.net/legal/mozilla_vpn_privacy_notice',
        'product:privacyNoticeURL':
          'https://www.mozilla.org/privacy/mozilla-vpn/',
        'product:successActionButtonLabel': 'Do somethin',
        'product:successActionButtonLabel:fr-FR':
          'French version of do something',
        'product:termsOfServiceDownloadURL':
          'https://accounts-static.cdn.mozilla.net/legal/mozilla_vpn_tos',
        'product:termsOfServiceURL':
          'https://www.mozilla.org/about/legal/terms/mozilla-vpn',
        productOrder: '0',
        productSet: '123Done',
        successActionButtonURL: 'https://123done-stage.dev.lcip.org',
        'support:app:abc': 'Desktop',
        'support:app:xyz': 'Mobile',
        webIconURL:
          'https://123done-stage.dev.lcip.org/img/transparent-logo.png',
      },
      product_name: '123Done Pro',
      active: true,
      configuration: null,
      checkoutType: 'without-account',
    },
  },
};

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
    // acquisition query parameters
    // see https://mozilla.github.io/ecosystem-platform/relying-parties/reference/metrics-for-relying-parties#metrics-related-query-parameters
    // and https://mozilla-hub.atlassian.net/browse/FXA-7010?focusedCommentId=675937
    context: '123abc-_',
    data_cta_position: 'pricing',
    entrypoint: 'www.mozilla.org-vpn-product-page',
    entrypoint_experiment: 'entrypoint-experiment',
    entrypoint_variation: 'entrypoint-variation',
    form_type: 'button',
    service: 'dcdb5ae7add825d2',
    utm_campaign: 'vpn-product-page',
    utm_content: 'things-go-here',
    utm_medium: 'referral',
    utm_source: 'www.mozilla.org-vpn-product-page',
    utm_term: 'cohort-a',
  },
  request: {
    headers: {
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:72.0) Gecko/20100101 Firefox/72.0',
      'accept-language': 'en-US,en;q=0.7,de-DE;q=0.3',
    },
  },
};

const expectedOutput = {
  app_version: '148.8',
  device_id: '0123456789abcdef0123456789abcdef',
  event_properties: {
    service: '123done',
  },
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
    mockSentry.withScope.mockClear();
    mockSentry.captureMessage.mockClear();
    mockAmplitudeConfig.schemaValidation = true;
    mockAmplitudeConfig.rawEvents = false;
    Container.set(StatsD, { increment: jest.fn() });
  });
  it.only('logs a correctly formatted message', () => {
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
      lang: 'en-US',
    };
    mockAmplitudeConfig.rawEvents = true;
    amplitude(mocks.event, mocks.request, {
      ...mocks.data,
      useless: 'junk',
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
        countryCode: 'DE',
        os_name: 'Mac OS X',
        os_version: '10.14',
        language: 'en-US',
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
        'Amplitude event failed validation',
        Sentry.Severity.Error
      );
      expect(log.info).toHaveBeenCalledTimes(1);
    });

    it('logs/reports all validation errors', () => {
      mockSchemaValidatorFn.mockImplementation(() => {
        throw new Error(
          "Invalid data: event must have required property 'event_type', event must have required property 'time'"
        );
      });
      amplitude(mocks.event, mocks.request, {
        ...mocks.data,
      });
      expect(mockSchemaValidatorFn).toHaveBeenCalledTimes(1);
      expect(log.error).toHaveBeenCalledTimes(1);
      expect(log.error.mock.calls[0][0]).toBe('amplitude.validationError');
      expect(log.error.mock.calls[0][1]['err']['message']).toBe(
        "Invalid data: event must have required property 'event_type', event must have required property 'time'"
      );
      expect(mockSentry.withScope).toHaveBeenCalledTimes(1);
      expect(scope.setContext).toHaveBeenCalledTimes(1);
      expect(scope.setContext.mock.calls[0][0]).toBe(
        'amplitude.validationError'
      );
      expect(scope.setContext.mock.calls[0][1]['error']).toBe(
        "Invalid data: event must have required property 'event_type', event must have required property 'time'"
      );
      expect(mockSentry.captureMessage).toHaveBeenCalledTimes(1);
      expect(mockSentry.captureMessage).toHaveBeenCalledWith(
        'Amplitude event failed validation',
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
  describe('geoDB location helpers', () => {
    describe('getLocation', () => {
      it('geolocates when geoDB is enabled', () => {
        const expected = { ...mockLocation };
        const actual = getLocation(mocks.request);
        expect(actual).toStrictEqual(expected);
      });
      it('uses locationOverride if present', () => {
        mockGeoDBConfig.locationOverride = { location: {} };
        const expected = {};
        const actual = getLocation(mocks.request);
        expect(actual).toStrictEqual(expected);
      });
      it('returns the countryCode specified in locationOverride', () => {
        mockGeoDBConfig.locationOverride = { location: { countryCode: 'US' } };
        const expected = { countryCode: 'US' };
        const actual = getLocation(mocks.request);
        expect(actual).toStrictEqual(expected);
      });
      it('does not use locationOverride with default value', () => {
        mockGeoDBConfig.locationOverride = {};
        const expected = { ...mockLocation };
        const actual = getLocation(mocks.request);
        expect(actual).toStrictEqual(expected);
      });
      it('does not geolocate when geoDB is disabled', () => {
        mockGeoDBConfig.enabled = false;
        const expected = {};
        const actual = getLocation(mocks.request);
        expect(actual).toStrictEqual(expected);
      });
    });
    describe('getCountryCode', () => {
      it('returns the country code when location.countryCode is available', () => {
        const expected = 'DE';
        const actual = getCountryCode(mockLocation);
        expect(actual).toStrictEqual(expected);
      });
      it('returns null when location is falsy', () => {
        const falsyLocation = undefined;
        const expected = null;
        const actual = getCountryCode(falsyLocation);
        expect(actual).toStrictEqual(expected);
      });
      it('returns null when location has no countryCode', () => {
        const emptyLocation = {};
        const expected = null;
        const actual = getCountryCode(emptyLocation);
        expect(actual).toStrictEqual(expected);
      });
    });
  });
});
