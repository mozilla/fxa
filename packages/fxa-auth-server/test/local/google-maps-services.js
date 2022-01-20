/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const Sentry = require('@sentry/node');
const { mockLog } = require('../mocks');
const sinon = require('sinon');
const { GoogleMapsService } = require('../../lib/google-maps-services');
const { default: Container } = require('typedi');
const { AuthLogger, AppConfig } = require('../../lib/types');

function deepCopy(object) {
  return JSON.parse(JSON.stringify(object));
}

const geocodeResultMany = {
  data: {
    results: [
      {
        address_components: [
          {
            long_name: 'Maryland',
            short_name: 'MD',
            types: ['administrative_area_level_1', 'political'],
          },
        ],
      },
      {
        address_components: [
          {
            long_name: 'New York',
            short_name: 'NY',
            types: ['administrative_area_level_1', 'political'],
          },
        ],
      },
    ],
    status: 'OK',
  },
};

const geocodeResultWithoutState = {
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
            long_name: 'United States',
            short_name: 'US',
            types: ['country', 'political'],
          },
        ],
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
            long_name: 'Saxony-Anhalt',
            short_name: 'SA',
            types: ['administrative_area_level_1', 'political'],
          },
        ],
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

describe('GoogleMapsServices', () => {
  let log;

  beforeEach(() => {
    log = mockLog();
    Container.set(AuthLogger, log);
    Container.set(AppConfig, mockConfig);
    googleMapsServices = new GoogleMapsService();
    googleMapsServices.client = googleClient = {};
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('getStateFromZip', () => {
    it('returns location for zip code and country', async () => {
      const expectedResult = 'SA';
      const expectedAddress = '06369, Germany';
      googleClient.geocode = sinon.stub().resolves(geocodeResultDEZip);

      const actualResult = await googleMapsServices.getStateFromZip(
        '06369',
        'DE'
      );
      assert.equal(actualResult, expectedResult);
      assert.isTrue(googleClient.geocode.calledOnce);
      assert.equal(
        googleClient.geocode.getCall(0).args[0].params.address,
        expectedAddress
      );
    });

    it('returns location for zip code and country if more than 1 result is returned with matching states', async () => {
      const geocodeResultManyMatchingStates = deepCopy(geocodeResultMany);
      geocodeResultManyMatchingStates.data.results[1].address_components[0].short_name =
        'MD';
      const expectedResult = 'MD';
      const expectedAddress = '11111, United States of America';
      googleClient.geocode = sinon
        .stub()
        .resolves(geocodeResultManyMatchingStates);

      const actualResult = await googleMapsServices.getStateFromZip(
        '11111',
        'US'
      );
      assert.equal(actualResult, expectedResult);
      assert.isTrue(googleClient.geocode.calledOnce);
      assert.equal(
        googleClient.geocode.getCall(0).args[0].params.address,
        expectedAddress
      );
    });

    it('Throws error if more than 1 result is returned with mismatching states', async () => {
      const expectedMessage = 'Could not find unique results. (11111, Germany)';
      googleClient.geocode = sinon.stub().resolves(geocodeResultMany);

      try {
        await googleMapsServices.getStateFromZip('11111', 'DE');
        assert.fail(expectedMessage);
      } catch (err) {
        assert.equal(
          expectedMessage,
          googleMapsServices.log.error.getCall(0).args[1].error.message
        );
      }
    });

    it('Throws error for invalid country code', async () => {
      const expectedMessage =
        'Invalid country (Germany). Only ISO 3166-1 alpha-2 country codes are supported.';

      try {
        await googleMapsServices.getStateFromZip('11111', 'Germany');
        assert.fail(expectedMessage);
      } catch (err) {
        assert.equal(
          expectedMessage,
          googleMapsServices.log.error.getCall(0).args[1].error.message
        );
      }
    });

    it('Throws error for zip code without state', async () => {
      const expectedMessage = 'State could not be found. (11111, Germany)';
      googleClient.geocode = sinon.stub().resolves(geocodeResultWithoutState);

      try {
        await googleMapsServices.getStateFromZip('11111', 'DE');
        assert.fail(expectedMessage);
      } catch (err) {
        assert.equal(
          expectedMessage,
          googleMapsServices.log.error.getCall(0).args[1].error.message
        );
      }
    });

    it('Throws error if no results were found', async () => {
      const expectedMessage =
        'Could not find any results for address. (11111, Germany)';
      googleClient.geocode = sinon.stub().resolves(noResult);

      try {
        await googleMapsServices.getStateFromZip('11111', 'DE');
        assert.fail(expectedMessage);
      } catch (err) {
        assert.equal(
          expectedMessage,
          googleMapsServices.log.error.getCall(0).args[1].error.message
        );
      }
    });

    it('Throws error for bad status code', async () => {
      const expectedMessage =
        'UNKNOWN_ERROR - An unknown error has occurred. (11111, Germany)';
      googleClient.geocode = sinon.stub().resolves(noResultWithError);

      const scopeContextSpy = sinon.fake();
      const scopeSpy = {
        setContext: scopeContextSpy,
      };
      sinon.replace(Sentry, 'withScope', (fn) => fn(scopeSpy));
      sinon.replace(Sentry, 'captureMessage', sinon.stub());

      try {
        await googleMapsServices.getStateFromZip('11111', 'DE');
        assert.fail(expectedMessage);
      } catch (err) {
        assert.equal(
          expectedMessage,
          googleMapsServices.log.error.getCall(0).args[1].error.message
        );
        assert.isTrue(scopeContextSpy.calledOnce);
        assert.isTrue(Sentry.captureMessage.calledOnce);
      }
    });

    it('Throws error when GeocodeData fails', async () => {
      const expectedMessage = 'Geocode is not available';
      googleClient.geocode = sinon.stub().rejects(new Error(expectedMessage));

      const scopeContextSpy = sinon.fake();
      const scopeSpy = {
        setContext: scopeContextSpy,
      };
      sinon.replace(Sentry, 'withScope', (fn) => fn(scopeSpy));
      sinon.replace(Sentry, 'captureMessage', sinon.stub());

      try {
        await googleMapsServices.getStateFromZip('11111', 'DE');
        assert.fail(expectedMessage);
      } catch (err) {
        assert.equal(
          expectedMessage,
          googleMapsServices.log.error.getCall(0).args[1].error.message
        );
        assert.isTrue(scopeContextSpy.calledOnce);
        assert.isTrue(Sentry.captureMessage.calledOnce);
      }
    });
  });
});
