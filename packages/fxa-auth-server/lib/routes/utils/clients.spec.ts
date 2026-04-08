/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sinon from 'sinon';
import moment from 'moment';

const mocks = require('../../../test/mocks');

const EARLIEST_SANE_TIMESTAMP = 31536000000;

/**
 * Simplified mockRequest — the shared mocks.mockRequest() uses proxyquire
 * with relative paths that don't resolve from lib/routes/.
 */
function mockRequest(data: any) {
  return {
    app: {
      acceptLanguage: 'en-US',
      clientAddress: '63.245.221.32',
      devices: Promise.resolve([]),
      features: new Set(),
      geo: {
        timeZone: 'America/Los_Angeles',
        location: {
          city: 'Mountain View',
          country: 'United States',
          countryCode: 'US',
          state: 'California',
          stateCode: 'CA',
        },
      },
      locale: 'en-US',
      metricsContext: Promise.resolve({}),
      ua: {
        browser: 'Firefox',
        browserVersion: '57.0',
        os: 'Mac OS X',
        osVersion: '10.13',
        deviceType: null,
        formFactor: null,
      },
      isMetricsEnabled: Promise.resolve(true),
    },
    auth: {
      credentials: data.credentials,
    },
    clearMetricsContext: sinon.stub(),
    emitMetricsEvent: sinon.stub().resolves(),
    emitRouteFlowEvent: sinon.stub().resolves(),
    gatherMetricsContext: sinon
      .stub()
      .callsFake((d: any) => Promise.resolve(d)),
    headers: {
      'user-agent': 'test user-agent',
    },
    info: {
      received: Date.now() - 1,
      completed: 0,
    },
    params: {},
    payload: data.payload || {},
  };
}

const makeClientUtils = (options: any) => {
  const log = options.log || mocks.mockLog();
  const config = options.config || {};
  config.lastAccessTimeUpdates = config.lastAccessTimeUpdates || {
    earliestSaneTimestamp: EARLIEST_SANE_TIMESTAMP,
  };
  config.i18n = config.i18n || {
    supportedLanguages: ['en', 'fr', 'wibble'],
    defaultLanguage: 'en',
  };
  return require('./clients')(log, config);
};

describe('clientUtils.formatLocation', () => {
  let log: any, clientUtils: any, request: any;

  beforeEach(() => {
    log = mocks.mockLog();
    clientUtils = makeClientUtils({ log });
    request = mockRequest({});
  });

  it('sets empty location if no info is available', () => {
    const client: any = {};
    clientUtils.formatLocation(client, request);
    expect(client.location).toEqual({});
    expect(log.warn.callCount).toBe(0);
  });

  it('sets empty location if location is null', () => {
    const client: any = {
      location: null,
    };
    clientUtils.formatLocation(client, request);
    expect(client.location).toEqual({});
    expect(log.warn.callCount).toBe(0);
  });

  it('leaves location info untranslated by default', () => {
    const client: any = {
      location: {
        city: 'Testville',
        state: 'Testachusetts',
        stateCode: '1234',
        country: 'USA',
        countryCode: '9876',
      },
    };
    clientUtils.formatLocation(client, request);
    expect(client.location).toEqual({
      city: 'Testville',
      state: 'Testachusetts',
      country: 'USA',
      stateCode: '1234',
    });
    expect(log.warn.callCount).toBe(0);
  });

  it('leaves location info untranslated for english', () => {
    request.app.acceptLanguage = 'en;q=0.95';
    const client: any = {
      location: {
        city: 'Testville',
        state: 'Testachusetts',
        stateCode: '1234',
        country: 'USA',
        countryCode: '9876',
      },
    };
    clientUtils.formatLocation(client, request);
    expect(client.location).toEqual({
      city: 'Testville',
      state: 'Testachusetts',
      country: 'USA',
      stateCode: '1234',
    });
    expect(log.warn.callCount).toBe(0);
  });

  it('translates only the country name for other languages', () => {
    request.app.acceptLanguage = 'en;q=0.5, fr;q=0.51';
    const client: any = {
      location: {
        city: 'Bournemouth',
        state: 'England',
        stateCode: 'EN',
        country: 'United Kingdom',
        countryCode: 'GB',
      },
    };
    clientUtils.formatLocation(client, request);
    expect(client.location).toEqual({
      country: 'Royaume-Uni',
    });
    expect(log.warn.callCount).toBe(0);
  });
});

describe('clientUtils.formatTimestamps', () => {
  let log: any, clientUtils: any, request: any;

  beforeEach(() => {
    log = mocks.mockLog();
    clientUtils = makeClientUtils({ log });
    request = mockRequest({});
  });

  it('formats timestamps in english by default', () => {
    const now = Date.now();
    const client: any = {
      createdTime: now - 2 * 60 * 1000,
      lastAccessTime: now,
    };
    clientUtils.formatTimestamps(client, request);
    expect(client.createdTime).toBe(now - 2 * 60 * 1000);
    expect(client.createdTimeFormatted).toBe('2 minutes ago');
    expect(client.lastAccessTime).toBe(now);
    expect(client.lastAccessTimeFormatted).toBe('a few seconds ago');
    expect(client.approximateLastAccessTime).toBeUndefined();
    expect(client.approximateLastAccessTimeFormatted).toBeUndefined();
  });

  it('ignores missing timestamps', () => {
    const now = Date.now();
    const client: any = {
      lastAccessTime: now,
    };
    clientUtils.formatTimestamps(client, request);
    expect(client.createdTime).toBeUndefined();
    expect(client.createdTimeFormatted).toBeUndefined();
    expect(client.lastAccessTime).toBe(now);
    expect(client.lastAccessTimeFormatted).toBe('a few seconds ago');
    expect(client.approximateLastAccessTime).toBeUndefined();
    expect(client.approximateLastAccessTimeFormatted).toBeUndefined();
  });

  it('sets approximateLastAccessTime if lastAccessTime is too early', () => {
    const client: any = {
      lastAccessTime: EARLIEST_SANE_TIMESTAMP - 20,
    };
    clientUtils.formatTimestamps(client, request);
    expect(client.createdTime).toBeUndefined();
    expect(client.createdTimeFormatted).toBeUndefined();
    expect(client.lastAccessTime).toBe(EARLIEST_SANE_TIMESTAMP - 20);
    expect(client.lastAccessTimeFormatted).toBe(
      moment(EARLIEST_SANE_TIMESTAMP - 20)
        .locale('en')
        .fromNow()
    );
    expect(client.approximateLastAccessTime).toBe(EARLIEST_SANE_TIMESTAMP);
    expect(client.approximateLastAccessTimeFormatted).toBe(
      moment(EARLIEST_SANE_TIMESTAMP).locale('en').fromNow()
    );
  });

  it('formats timestamps according to accept-language header', () => {
    const now = Date.now();
    const client: any = {
      createdTime: now - 2 * 60 * 1000,
      lastAccessTime: now,
    };
    request.app.acceptLanguage = 'en;q=0.5, fr;q=0.51';
    clientUtils.formatTimestamps(client, request);
    expect(client.createdTime).toBe(now - 2 * 60 * 1000);
    expect(client.createdTimeFormatted).toBe('il y a 2 minutes');
    expect(client.lastAccessTime).toBe(now);
    expect(client.lastAccessTimeFormatted).toBe('il y a quelques secondes');
    expect(client.approximateLastAccessTime).toBeUndefined();
    expect(client.approximateLastAccessTimeFormatted).toBeUndefined();
  });
});
