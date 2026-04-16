/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Sentry from '@sentry/node';
import { default as Container } from 'typedi';

const sentryModule = require('./sentry');
const { mockLog } = require('../test/mocks');
const { GoogleMapsService } = require('./google-maps-services');
const { AuthLogger, AppConfig } = require('./types');

function deepCopy(object: any) {
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
          {
            long_name: '11111',
            short_name: '11111',
            types: ['postal_code'],
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

let googleMapsServices: any;
let googleClient: any;

describe('GoogleMapsServices', () => {
  let log: any;

  beforeEach(() => {
    log = mockLog();
    Container.set(AuthLogger, log);
    Container.set(AppConfig, mockConfig);
    googleMapsServices = new GoogleMapsService();
    googleMapsServices.client = googleClient = {};
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Container.reset();
  });

  describe('getStateFromZip', () => {
    it('returns location for zip code and country', async () => {
      const expectedResult = 'SA';
      const expectedAddress = '06369, Germany';
      googleClient.geocode = jest.fn().mockResolvedValue(geocodeResultDEZip);

      const actualResult = await googleMapsServices.getStateFromZip(
        '06369',
        'DE'
      );
      expect(actualResult).toBe(expectedResult);
      expect(googleClient.geocode).toHaveBeenCalledTimes(1);
      expect(googleClient.geocode.mock.calls[0][0].params.address).toBe(
        expectedAddress
      );
    });

    it('returns location for zip code and country if more than 1 result is returned with matching states', async () => {
      const geocodeResultManyMatchingStates = deepCopy(geocodeResultMany);
      geocodeResultManyMatchingStates.data.results[1].address_components[0].short_name =
        'MD';
      const expectedResult = 'MD';
      const expectedAddress = '11111, United States of America';
      googleClient.geocode = jest
        .fn()
        .mockResolvedValue(geocodeResultManyMatchingStates);

      const actualResult = await googleMapsServices.getStateFromZip(
        '11111',
        'US'
      );
      expect(actualResult).toBe(expectedResult);
      expect(googleClient.geocode).toHaveBeenCalledTimes(1);
      expect(googleClient.geocode.mock.calls[0][0].params.address).toBe(
        expectedAddress
      );
    });

    it('Throws error if more than 1 result is returned with mismatching states', async () => {
      const expectedMessage = 'Could not find unique results. (22222, Germany)';
      googleClient.geocode = jest.fn().mockResolvedValue(geocodeResultMany);

      try {
        await googleMapsServices.getStateFromZip('22222', 'DE');
        throw new Error('Expected error to be thrown');
      } catch (err) {
        expect(
          googleMapsServices.log.error.mock.calls[0][1].error.message
        ).toBe(expectedMessage);
      }
    });

    it('Throws error for invalid country code', async () => {
      const expectedMessage =
        'Invalid country (Germany). Only ISO 3166-1 alpha-2 country codes are supported.';

      try {
        await googleMapsServices.getStateFromZip('11111', 'Germany');
        throw new Error('Expected error to be thrown');
      } catch (err) {
        expect(
          googleMapsServices.log.error.mock.calls[0][1].error.message
        ).toBe(expectedMessage);
      }
    });

    it('Throws error for zip code without state', async () => {
      const expectedMessage = 'State could not be found. (11111, Germany)';
      googleClient.geocode = jest
        .fn()
        .mockResolvedValue(geocodeResultWithoutState);

      try {
        await googleMapsServices.getStateFromZip('11111', 'DE');
        throw new Error('Expected error to be thrown');
      } catch (err) {
        expect(
          googleMapsServices.log.error.mock.calls[0][1].error.message
        ).toBe(expectedMessage);
      }
    });

    it('Throws error if no results were found', async () => {
      const expectedMessage =
        'Could not find any results for address. (11111, Germany)';
      googleClient.geocode = jest.fn().mockResolvedValue(noResult);

      try {
        await googleMapsServices.getStateFromZip('11111', 'DE');
        throw new Error('Expected error to be thrown');
      } catch (err) {
        expect(
          googleMapsServices.log.error.mock.calls[0][1].error.message
        ).toBe(expectedMessage);
      }
    });

    it('Throws error for bad status code', async () => {
      const expectedMessage =
        'UNKNOWN_ERROR - An unknown error has occurred. (11111, Germany)';
      googleClient.geocode = jest.fn().mockResolvedValue(noResultWithError);

      const scopeContextSpy = jest.fn();
      const scopeSpy = {
        setContext: scopeContextSpy,
      };
      jest
        .spyOn(Sentry, 'withScope')
        .mockImplementation(((fn: any) => fn(scopeSpy)) as any);
      jest.spyOn(sentryModule, 'reportSentryMessage').mockReturnValue({});

      try {
        await googleMapsServices.getStateFromZip('11111', 'DE');
        throw new Error('Expected error to be thrown');
      } catch (err) {
        expect(
          googleMapsServices.log.error.mock.calls[0][1].error.message
        ).toBe(expectedMessage);
        expect(scopeContextSpy).toHaveBeenCalledTimes(1);
        expect(sentryModule.reportSentryMessage).toHaveBeenCalledTimes(1);
      }
    });

    it('Throws error when GeocodeData fails', async () => {
      const expectedMessage = 'Geocode is not available';
      googleClient.geocode = jest
        .fn()
        .mockRejectedValue(new Error(expectedMessage));

      const scopeContextSpy = jest.fn();
      const scopeSpy = {
        setContext: scopeContextSpy,
      };
      jest
        .spyOn(Sentry, 'withScope')
        .mockImplementation(((fn: any) => fn(scopeSpy)) as any);
      jest.spyOn(sentryModule, 'reportSentryMessage').mockReturnValue({});

      try {
        await googleMapsServices.getStateFromZip('11111', 'DE');
        throw new Error('Expected error to be thrown');
      } catch (err) {
        expect(
          googleMapsServices.log.error.mock.calls[0][1].error.message
        ).toBe(expectedMessage);
        expect(scopeContextSpy).toHaveBeenCalledTimes(1);
        expect(sentryModule.reportSentryMessage).toHaveBeenCalledTimes(1);
      }
    });
  });
});
