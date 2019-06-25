/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };
const mocks = require('../../../mocks');
const moment = require('fxa-shared/node_modules/moment');

const EARLIEST_SANE_TIMESTAMP = 31536000000;

const makeClientUtils = options => {
  const log = options.log || mocks.mockLog();
  const config = options.config || {};
  config.lastAccessTimeUpdates = config.lastAccessTimeUpdates || {
    earliestSaneTimestamp: EARLIEST_SANE_TIMESTAMP,
  };
  config.i18n = config.i18n || {
    supportedLanguages: ['en', 'fr'],
    defaultLanguage: 'en',
  };
  return require('../../../../lib/routes/utils/clients')(log, config);
};

describe('clientUtils.formatLocation', () => {
  let log, clientUtils, request;

  beforeEach(() => {
    log = mocks.mockLog();
    clientUtils = makeClientUtils({ log });
    request = mocks.mockRequest({});
  });

  it('sets empty location if no info is available', () => {
    const client = {};
    clientUtils.formatLocation(client, request);
    assert.deepEqual(client.location, {});
    assert.equal(log.warn.callCount, 0);
  });

  it('sets empty location if location is null', () => {
    const client = {
      location: null,
    };
    clientUtils.formatLocation(client, request);
    assert.deepEqual(client.location, {});
    assert.equal(log.warn.callCount, 0);
  });

  it('leaves location info untranslated by default', () => {
    const client = {
      location: {
        city: 'Testville',
        state: 'Testachusetts',
        stateCode: '1234',
        country: 'USA',
        countryCode: '9876',
      },
    };
    clientUtils.formatLocation(client, request);
    assert.deepEqual(client.location, {
      city: 'Testville',
      state: 'Testachusetts',
      country: 'USA',
      stateCode: '1234',
    });
    assert.equal(log.warn.callCount, 0);
  });

  it('leaves location info untranslated for english', () => {
    request.app.acceptLanguage = 'en;q=0.95';
    const client = {
      location: {
        city: 'Testville',
        state: 'Testachusetts',
        stateCode: '1234',
        country: 'USA',
        countryCode: '9876',
      },
    };
    clientUtils.formatLocation(client, request);
    assert.deepEqual(client.location, {
      city: 'Testville',
      state: 'Testachusetts',
      country: 'USA',
      stateCode: '1234',
    });
    assert.equal(log.warn.callCount, 0);
  });

  it('translates only the country name for other languages', () => {
    request.app.acceptLanguage = 'en;q=0.5, fr;q=0.51';
    const client = {
      location: {
        city: 'Bournemouth',
        state: 'England',
        stateCode: 'EN',
        country: 'United Kingdom',
        countryCode: 'GB',
      },
    };
    clientUtils.formatLocation(client, request);
    assert.deepEqual(client.location, {
      country: 'Royaume-Uni',
    });
    assert.equal(log.warn.callCount, 0);
  });
});

describe('clientUtils.formatTimestamps', () => {
  let log, clientUtils, request;

  beforeEach(() => {
    log = mocks.mockLog();
    clientUtils = makeClientUtils({ log });
    request = mocks.mockRequest({});
  });

  it('formats timestamps in english by default', () => {
    const now = Date.now();
    const client = {
      createdTime: now - 2 * 60 * 1000,
      lastAccessTime: now,
    };
    clientUtils.formatTimestamps(client, request);
    assert.equal(client.createdTime, now - 2 * 60 * 1000);
    assert.equal(client.createdTimeFormatted, '2 minutes ago');
    assert.equal(client.lastAccessTime, now);
    assert.equal(client.lastAccessTimeFormatted, 'a few seconds ago');
    assert.equal(client.approximateLastAccessTime, undefined);
    assert.equal(client.approximateLastAccessTimeFormatted, undefined);
  });

  it('ignores missing timestamps', () => {
    const now = Date.now();
    const client = {
      lastAccessTime: now,
    };
    clientUtils.formatTimestamps(client, request);
    assert.equal(client.createdTime, undefined);
    assert.equal(client.createdTimeFormatted, undefined);
    assert.equal(client.lastAccessTime, now);
    assert.equal(client.lastAccessTimeFormatted, 'a few seconds ago');
    assert.equal(client.approximateLastAccessTime, undefined);
    assert.equal(client.approximateLastAccessTimeFormatted, undefined);
  });

  it('sets approximateLastAccessTime if lastAccessTime is too early', () => {
    const client = {
      lastAccessTime: EARLIEST_SANE_TIMESTAMP - 20,
    };
    clientUtils.formatTimestamps(client, request);
    assert.equal(client.createdTime, undefined);
    assert.equal(client.createdTimeFormatted, undefined);
    assert.equal(client.lastAccessTime, EARLIEST_SANE_TIMESTAMP - 20);
    assert.equal(
      client.lastAccessTimeFormatted,
      moment(EARLIEST_SANE_TIMESTAMP - 20)
        .locale('en')
        .fromNow()
    );
    assert.equal(client.approximateLastAccessTime, EARLIEST_SANE_TIMESTAMP);
    assert.equal(
      client.approximateLastAccessTimeFormatted,
      moment(EARLIEST_SANE_TIMESTAMP)
        .locale('en')
        .fromNow()
    );
  });

  it('formats timestamps according to accept-language header', () => {
    const now = Date.now();
    const client = {
      createdTime: now - 2 * 60 * 1000,
      lastAccessTime: now,
    };
    request.app.acceptLanguage = 'en;q=0.5, fr;q=0.51';
    clientUtils.formatTimestamps(client, request);
    assert.equal(client.createdTime, now - 2 * 60 * 1000);
    assert.equal(client.createdTimeFormatted, 'il y a 2 minutes');
    assert.equal(client.lastAccessTime, now);
    assert.equal(client.lastAccessTimeFormatted, 'il y a quelques secondes');
    assert.equal(client.approximateLastAccessTime, undefined);
    assert.equal(client.approximateLastAccessTimeFormatted, undefined);
  });
});
