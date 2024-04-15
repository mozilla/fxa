/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { GeoDBFetchDataFailed, GeoDBInvalidIp } from './geodb.error';
import { GeoDBCityReader } from './geodb.provider';
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

describe('GeoDBRepository', () => {
  const ip = '127.0.0.1';
  const mockReader = {
    get: jest.fn(),
  };
  const mockGeoDBCityReader = mockReader as unknown as GeoDBCityReader;

  beforeEach(() => {
    mockValidate.mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('errors on ip', () => {
    mockValidate.mockReturnValue(false);
    try {
      getLocationData(mockGeoDBCityReader, ip);
      fail('it should have thrown an error...');
    } catch (error) {
      expect(error).toEqual(new GeoDBInvalidIp());
    }
  });

  it('errors on no data', () => {
    mockReader.get.mockReturnValue(null);
    try {
      getLocationData(mockGeoDBCityReader, ip);
      fail('it should have thrown an error...');
    } catch (error) {
      expect(error).toEqual(new GeoDBFetchDataFailed());
    }
  });

  it('returns location data', () => {
    const cityResponse = CityResponseFactory({
      country: CountryRecordFactory(),
    });
    mockReader.get.mockReturnValue(cityResponse);
    const result = getLocationData(
      mockReader as unknown as GeoDBCityReader,
      ''
    );
    expect(result).toEqual(cityResponse);
  });
});
