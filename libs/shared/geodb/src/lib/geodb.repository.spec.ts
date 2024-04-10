/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { GeodbFetchDataFailed, GeodbInvalidIp } from './geodb.error';
import { GeodbCityReader } from './geodb.provider';
import { getLocationData } from './geodb.repository';
import { CityResponseFactory, CountryRecordFactory } from './maxmind.factories';

const mockValidate = jest.fn();

jest.mock('maxmind', function () {
  return {
    validate: function () {
      return mockValidate();
    },
  };
});

describe('GeodbRepository', () => {
  const ip = '127.0.0.1';
  const mockReader = {
    get: jest.fn(),
  };
  const mockGeodbCityReader = mockReader as unknown as GeodbCityReader;

  beforeEach(() => {
    mockValidate.mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('errors on ip', () => {
    mockValidate.mockReturnValue(false);
    try {
      getLocationData(mockGeodbCityReader, ip);
      fail('it should have thrown an error...');
    } catch (error) {
      expect(error).toEqual(new GeodbInvalidIp());
    }
  });

  it('errors on no data', () => {
    mockReader.get.mockReturnValue(null);
    try {
      getLocationData(mockGeodbCityReader, ip);
      fail('it should have thrown an error...');
    } catch (error) {
      expect(error).toEqual(new GeodbFetchDataFailed());
    }
  });

  it('returns location data', () => {
    const cityResponse = CityResponseFactory({
      country: CountryRecordFactory(),
    });
    mockReader.get.mockReturnValue(cityResponse);
    const result = getLocationData(
      mockReader as unknown as GeodbCityReader,
      ''
    );
    expect(result).toEqual(cityResponse);
  });
});
