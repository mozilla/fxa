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
  let mockReader = {
    get: jest.fn(),
  };
  let mockGeodbCityReader = mockReader as unknown as GeodbCityReader;

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
