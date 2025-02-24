/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';
import { GeocodeResultFactory } from './factories';
import { GoogleClient } from './google.client';
import { MockGoogleClientConfigProvider } from './google.client.config';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';

const mockJestFnGenerator = <T extends (...args: any[]) => any>() => {
  return jest.fn<ReturnType<T>, Parameters<T>>();
};

const mockGoogleMapsGeocode = mockJestFnGenerator();

jest.mock('@googlemaps/google-maps-services-js', () => ({
  Client: function () {
    return {
      geocode: mockGoogleMapsGeocode,
    };
  },
}));

describe('GoogleClient', () => {
  let googleClient: GoogleClient;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GoogleClient,
        MockGoogleClientConfigProvider,
        MockStatsDProvider,
      ],
    }).compile();

    googleClient = module.get<GoogleClient>(GoogleClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('geocode', () => {
    it('should return a response', async () => {
      const mockPostalCode = '90210';
      const mockCountryCode = 'US';
      const mockResponse = {
        data: {
          results: [
            GeocodeResultFactory({
              formatted_address: 'Beverly Hills, CA 90210, USA',
            }),
          ],
        },
      };

      mockGoogleMapsGeocode.mockResolvedValue(mockResponse);

      const result = await googleClient.geocode(
        mockPostalCode,
        mockCountryCode
      );
      expect(result).toEqual(mockResponse.data);
    });
  });
});
