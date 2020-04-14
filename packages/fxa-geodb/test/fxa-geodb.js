/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { assert } = require('chai');
const DEFAULTS = require('../lib/defaults');
const ERRORS = require('../lib/errors');

describe('fxa-geodb', () => {
  'use strict';

  let geoDb;

  beforeEach(() => {
    geoDb = require('../lib/fxa-geodb')();
  });

  it('throws early when supplied with a non-existent file', () => {
    assert.throws(() =>
      require('../lib/fxa-geodb')({
        dbPath: 'completely-not-there.mmdb',
      })
    );
  });

  it('throws `IS_INVALID` when supplied with an undefined ip variable', () => {
    assert.throws(geoDb, Error, ERRORS.IS_INVALID);
  });

  it('throws `IS_INVALID` when supplied with an object', () => {
    assert.throws(() => geoDb({}), Error, ERRORS.IS_INVALID);
  });

  it('throws `IS_INVALID` when supplied with an empty ip', () => {
    assert.throws(() => geoDb(''), Error, ERRORS.IS_INVALID);
  });

  it('throws `IS_INVALID` when supplied with an invalid ip', () => {
    assert.throws(() => geoDb('5.6.7'), Error, ERRORS.IS_INVALID);
  });

  it('returns an object with location data when supplied with a valid ip address', () => {
    const location = geoDb(DEFAULTS.GEODB_TEST_IP);

    assert.equal(
      location.country,
      'United States',
      'Country returned correctly'
    );
    assert.equal(location.countryCode, 'US', 'Country code returned correctly');
    assert.equal(location.city, 'Mountain View', 'City returned correctly');
    assert.equal(
      location.continent,
      'North America',
      'Continent returned correctly'
    );
    assert.deepEqual(
      location.latLong,
      {
        latitude: 37.3897,
        longitude: -122.0832,
      },
      'LatLong returned correctly'
    );
    assert.equal(
      location.timeZone,
      'America/Los_Angeles',
      'Timezone returned correctly'
    );
  });

  it('throws `UNABLE_TO_FETCH_DATA` when no data is available', () => {
    assert.throws(() => geoDb('localhost'), Error, ERRORS.UNABLE_TO_FETCH_DATA);
  });

  it('returns an object with partial location data when complete data is not available', () => {
    // 64.11.221.194 is an unassigned IP in North America, will probably return incomplete data
    const location = geoDb('64.11.221.194');

    assert.equal(
      location.country,
      'United States',
      'Country returned correctly'
    );
    assert.equal(location.countryCode, 'US', 'Country code returned correctly');
    assert.equal(location.city, undefined, 'City undefined');
    assert.equal(
      location.continent,
      'North America',
      'Continent returned correctly'
    );
    assert.equal(location.timeZone, 'America/Chicago', 'Odd timezone returned');
  });
});
