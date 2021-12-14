/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const { mockLog } = require('../mocks');
const sinon = require('sinon');
const { GoogleMapsService } = require('../../lib/google-maps-services');
const { default: Container } = require('typedi');
const { AuthLogger, AppConfig } = require('../../lib/types');

// const geocodeResultUSZip = {
//   data: {
//     results: [
//       {
//         address_components: [
//           {
//             long_name: '20639',
//             short_name: '20639',
//             types: ['postal_code'],
//           },
//           {
//             long_name: 'Huntingtown',
//             short_name: 'Huntingtown',
//             types: ['locality', 'political'],
//           },
//           {
//             long_name: 'Calvert County',
//             short_name: 'Calvert County',
//             types: ['administrative_area_level_2', 'political'],
//           },
//           {
//             long_name: 'Maryland',
//             short_name: 'MD',
//             types: ['administrative_area_level_1', 'political'],
//           },
//           {
//             long_name: 'United States',
//             short_name: 'US',
//             types: ['country', 'political'],
//           },
//         ],
//         formatted_address: 'Huntingtown, MD 20639, USA',
//         place_id: 'ChIJyU14qhKDt4kRQcsnBrUz5IY',
//         types: ['postal_code'],
//       },
//     ],
//     status: 'OK',
//   },
// };

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

const noResultWithError = {
  data: {
    results: [],
    status: 'UNKNOWN_ERROR',
    error_message: 'An unknown error has occurred',
  },
};

const mockConfig = {
  googleMapsApiKey: 'foo',
};

let googleMapsServices;
let googleClient;

describe.skip('GoogleMapsServices', () => {
  let log;

  beforeEach(() => {
    log = mockLog();
    Container.set(AuthLogger, log);
    Container.set(AppConfig, mockConfig);
    googleMapsServices = new GoogleMapsService();
    googleMapsServices.client = googleClient = {};
  });

  afterEach(() => {
    Container.reset();
    sinon.restore();
  });

  describe('getGeocodeResults', () => {});

  describe('getStateFromZip', () => {
    it('returns location for zip code and country', async () => {
      const expectedResult = 'SA';

      googleClient.geocode = sinon.stub().resolves(geocodeResultDEZip);

      const actualResult = await googleMapsServices.getStateFromZip(
        '06369',
        'DE'
      );
      assert.equal(actualResult, expectedResult);
    });
  });

  it('returns empty object for invalid zipcode', async () => {
    const expectedResult = new Error('ZERO_RESULTS for 11111, Germany');

    googleClient.geocode = sinon.stub().resolves(noResult);

    try {
      await googleMapsServices.getStateFromZip('11111', 'DE');
      assert.fail('Error: ZERO_RESULTS for 11111, Germany');
    } catch (err) {
      console.log(err);
      console.log(err.address);
      console.log(Object.keys(err));
      assert.equal(
        `Error: ZERO_RESULTS for 11111, Germany`,
        googleMapsServices.log.error.getCall(0).args[1].error.message
      );
      assert.deepEqual(err.message, expectedResult.message);
    }
  });

  it('returns empty object for error from Geocoding API', async () => {
    const expectedResult = {};
    googleClient.geocode = sinon.stub().resolves(noResultWithError);

    const actualResult = await googleMapsServices.getStateFromZip(
      '11111',
      'DE'
    );
    assert.deepEqual(actualResult, expectedResult);
    assert.equal(
      `Error: UNKNOWN_ERROR - An unknown error has occurred for 11111, Germany`,
      googleMapsServices.log.error.getCall(0).args[1].error.message
    );
  });
});
