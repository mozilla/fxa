/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { PlaceType2, Status } from '@googlemaps/google-maps-services-js';
import { Test } from '@nestjs/testing';
import { GeocodeResultFactory } from './factories';
import { GoogleClient } from './google.client';
import { MockGoogleClientConfigProvider } from './google.client.config';
import { GoogleManager } from './google.manager';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';

describe('GoogleManager', () => {
  let googleClient: GoogleClient;
  let googleManager: GoogleManager;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GoogleClient,
        GoogleManager,
        MockGoogleClientConfigProvider,
        MockStatsDProvider,
      ],
    }).compile();

    googleClient = module.get<GoogleClient>(GoogleClient);
    googleManager = module.get<GoogleManager>(GoogleManager);
  });

  describe('validateAndFormatPostalCode', () => {
    it('should return true - US', async () => {
      const mockResponseData = {
        results: [
          GeocodeResultFactory({
            address_components: [
              {
                long_name: '90210',
                short_name: '90210',
                types: ['postal_code'] as PlaceType2[],
              },
            ],
            types: ['postal_code'] as PlaceType2[],
            formatted_address: 'Beverly Hills, CA 90210, USA',
          }),
        ],
        status: 'OK' as Status,
        error_message: '',
      };

      jest.spyOn(googleClient, 'geocode').mockResolvedValue(mockResponseData);

      const response = await googleManager.validateAndFormatPostalCode(
        '90210',
        'US'
      );
      expect(response).toEqual({
        isValid: true,
        formattedPostalCode: '90210',
      });
    });

    it('should return true - CA', async () => {
      const mockResponseData = {
        results: [
          GeocodeResultFactory({
            address_components: [
              {
                long_name: 'A1A 1A1',
                short_name: 'A1A 1A1',
                types: ['postal_code'] as PlaceType2[],
              },
            ],
            types: ['postal_code'] as PlaceType2[],
            formatted_address: 'A1A 1A1, CA',
          }),
        ],
        status: 'OK' as Status,
        error_message: '',
      };

      jest.spyOn(googleClient, 'geocode').mockResolvedValue(mockResponseData);

      const response = await googleManager.validateAndFormatPostalCode(
        'A1A1A1',
        'CA'
      );
      expect(response).toEqual({
        isValid: true,
        formattedPostalCode: 'A1A 1A1',
      });
    });

    it('should return true - Romanian bypass', async () => {
      const mockResponseData = {
        results: [
          GeocodeResultFactory({
            address_components: [
              {
                long_name: 'Romania',
                short_name: 'RO',
                types: ['country', 'political'] as PlaceType2[],
              },
            ],
            formatted_address: 'Romania',
            types: ['country', 'political'] as PlaceType2[],
          }),
        ],
        status: 'OK' as Status,
        error_message: '',
      };

      jest.spyOn(googleClient, 'geocode').mockResolvedValue(mockResponseData);

      const response = await googleManager.validateAndFormatPostalCode(
        '010000',
        'RO'
      );
      expect(response).toEqual({
        isValid: true,
        formattedPostalCode: '010000',
      });
    });

    it('should return false - Romanian non-matching', async () => {
      const mockResponseData = {
        results: [
          GeocodeResultFactory({
            address_components: [
              {
                long_name: 'Romania',
                short_name: 'RO',
                types: ['country', 'political'] as PlaceType2[],
              },
            ],
            formatted_address: 'Romania',
            types: ['country', 'political'] as PlaceType2[],
          }),
        ],
        status: 'OK' as Status,
        error_message: '',
      };

      jest.spyOn(googleClient, 'geocode').mockResolvedValue(mockResponseData);

      const response = await googleManager.validateAndFormatPostalCode(
        '00000',
        'RO'
      );
      expect(response).toEqual({
        isValid: false,
      });
    });

    it('should return false - 00000', async () => {
      const mockResponseData = {
        results: [
          GeocodeResultFactory({
            address_components: [
              {
                long_name: 'United States',
                short_name: 'US',
                types: ['country', 'political'] as PlaceType2[],
              },
            ],
            formatted_address: 'United States',
            types: ['country', 'political'] as PlaceType2[],
          }),
        ],
        status: 'OK' as Status,
        error_message: '',
      };

      jest.spyOn(googleClient, 'geocode').mockResolvedValue(mockResponseData);

      const response = await googleManager.validateAndFormatPostalCode(
        '00000',
        'US'
      );
      expect(response).toEqual({
        isValid: false,
      });
    });

    it('should return false - 1234', async () => {
      const mockResponseData = {
        results: [
          GeocodeResultFactory({
            address_components: [
              {
                long_name: 'United States',
                short_name: 'US',
                types: ['country', 'political'] as PlaceType2[],
              },
            ],
            formatted_address: 'United States',
            types: ['country', 'political'] as PlaceType2[],
          }),
        ],
        status: 'OK' as Status,
        error_message: '',
      };
      jest.spyOn(googleClient, 'geocode').mockResolvedValue(mockResponseData);

      const response = await googleManager.validateAndFormatPostalCode(
        '1234',
        'US'
      );
      expect(response).toEqual({
        isValid: false,
      });
    });
  });
});
