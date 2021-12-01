/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const { mockLog } = require('../mocks');
const sinon = require('sinon');
const { getLocationFromZip } = require('../../lib/geocoding');
const { Client } = require('@googlemaps/google-maps-services-js');

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

const log = mockLog();

describe('geocoding', () => {
  afterEach(() => {
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
    const geocodeStub = sinon.stub().resolves(geocodeResultUSZip);
    sinon.stub(Client.prototype, 'geocode').callsFake(geocodeStub);

    const actualResult = await getLocationFromZip(log, '20639');
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
    const geocodeStub = sinon.stub().resolves(geocodeResultDEZip);
    sinon.stub(Client.prototype, 'geocode').callsFake(geocodeStub);

    const actualResult = await getLocationFromZip('06369', 'DE');
    assert.deepEqual(actualResult, expectedResult);
  });

  it('returns null for invalid zipcode', async () => {
    const expectedResult = {};
    const geocodeStub = sinon.stub().resolves(noResult);
    sinon.stub(Client.prototype, 'geocode').callsFake(geocodeStub);

    const actualResult = await getLocationFromZip(log, '11111', 'DE');
    assert.deepEqual(actualResult, expectedResult);
  });
});
