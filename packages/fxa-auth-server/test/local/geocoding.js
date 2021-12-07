/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const { mockLog } = require('../mocks');
const sinon = require('sinon');
const { Geocoding } = require('../../lib/geocoding');
const { Client } = require('@googlemaps/google-maps-services-js');
const { default: Container } = require('typedi');

const geocodeResultUSZip = {
  data: {
    results: [
      {
        address_components: [
          {
            long_name: '20639',
            short_name: '20639',
            types: ['postal_code'],
          },
          {
            long_name: 'Huntingtown',
            short_name: 'Huntingtown',
            types: ['locality', 'political'],
          },
          {
            long_name: 'Calvert County',
            short_name: 'Calvert County',
            types: ['administrative_area_level_2', 'political'],
          },
          {
            long_name: 'Maryland',
            short_name: 'MD',
            types: ['administrative_area_level_1', 'political'],
          },
          {
            long_name: 'United States',
            short_name: 'US',
            types: ['country', 'political'],
          },
        ],
        formatted_address: 'Huntingtown, MD 20639, USA',
        place_id: 'ChIJyU14qhKDt4kRQcsnBrUz5IY',
        types: ['postal_code'],
      },
    ],
    status: 'OK',
  },
};

const geocodeResultDEZip = {
  data: {
    results: [
      {
        address_components: [
          {
            long_name: '06369',
            short_name: '06369',
            types: ['postal_code'],
          },
          {
            long_name: 'Diebzig',
            short_name: 'Diebzig',
            types: ['political', 'sublocality', 'sublocality_level_1'],
          },
          {
            long_name: 'Saxony-Anhalt',
            short_name: 'SA',
            types: ['administrative_area_level_1', 'political'],
          },
          {
            long_name: 'Germany',
            short_name: 'DE',
            types: ['country', 'political'],
          },
        ],
        formatted_address: '06369, Germany',
        place_id: 'ChIJU6PmZdsMpkcRsDHiRl1mIxw',
        types: ['postal_code'],
      },
    ],
    status: 'OK',
  },
};

const noResult = {
  data: {
    results: [],
    status: 'ZERO_RESULTS',
  },
};

const mockConfig = {
  subscriptions: {
    googleMapsApiKey: 'foo',
  },
};

describe('geocoding', () => {
  let log;

  beforeEach(() => {
    log = mockLog();
  });

  afterEach(() => {
    Container.reset();
    sinon.restore();
  });

  it('returns location for only zip code', async () => {
    const expectedResult = {
      city: 'Huntingtown',
      country: 'United States',
      countryCode: 'US',
      state: 'Maryland',
      stateCode: 'MD',
    };

    Container.set(Client, {
      geocode: sinon.fake.returns(geocodeResultUSZip),
    });

    const geocoding = new Geocoding(log, mockConfig);

    const actualResult = await geocoding.getLocationFromZip(log, '20639');
    assert.deepEqual(actualResult, expectedResult);
  });

  it('returns location for zip code and country', async () => {
    const expectedResult = {
      city: '',
      country: 'Germany',
      countryCode: 'DE',
      state: 'Saxony-Anhalt',
      stateCode: 'SA',
    };

    Container.set(Client, {
      geocode: sinon.fake.returns(geocodeResultDEZip),
    });

    const geocoding = new Geocoding(log, mockConfig);

    const actualResult = await geocoding.getLocationFromZip('06369', 'DE');
    assert.deepEqual(actualResult, expectedResult);
  });

  it('returns empty object for invalid zipcode', async () => {
    const expectedResult = {};

    Container.set(Client, {
      geocode: sinon.fake.returns(noResult),
    });

    const geocoding = new Geocoding(log, mockConfig);

    const actualResult = await geocoding.getLocationFromZip('11111', 'DE');
    assert.deepEqual(actualResult, expectedResult);
    console.log(geocoding.log.error.getCall(0).args[0]);
    assert.equal(
      `ZERO_RESULTS for 11111, DE`,
      geocoding.log.error.getCall(0).args[1].err
    );
  });
});
