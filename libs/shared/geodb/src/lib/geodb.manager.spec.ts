import { Test, TestingModule } from '@nestjs/testing';
import { GeodbManager } from './geodb.manager';
import { GeodbManagerConfig } from './geodb.config';
import { GeodbProvider } from './geodb.provider';
import {
  CityResponseFactory,
  CountryRecordFactory,
  PostalRecordFactory,
} from './maxmind.factories';

const mockGetLocationData = jest.fn();

jest.mock('./geodb.repository', () => {
  return {
    getLocationData: function () {
      return mockGetLocationData();
    },
  };
});

describe('GeodbManager', () => {
  let manager: GeodbManager;
  const mockReader = {};
  let mockConfig = {
    locationOverride: {
      countryCode: '',
      postalCode: '',
    },
  };

  beforeEach(async () => {
    mockConfig = {
      locationOverride: {
        countryCode: '',
        postalCode: '',
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: GeodbProvider, useValue: mockReader },
        { provide: GeodbManagerConfig, useValue: mockConfig },
        GeodbManager,
      ],
    }).compile();

    manager = module.get<GeodbManager>(GeodbManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', async () => {
    expect(manager).toBeDefined();
    expect(manager).toBeInstanceOf(GeodbManager);
  });

  describe('getTaxAddress', () => {
    it('should return tax address', () => {
      const countryFake = CountryRecordFactory();
      const postalFake = PostalRecordFactory();
      mockGetLocationData.mockReturnValue(
        CityResponseFactory({
          country: countryFake,
          postal: postalFake,
        })
      );
      const result = manager.getTaxAddress('');
      expect(result).toEqual({
        countryCode: countryFake.iso_code,
        postalCode: postalFake.code,
      });
    });

    it('should return tax address override values', () => {
      const expected = {
        countryCode: 'ZA',
        postalCode: '12332',
      };
      mockConfig.locationOverride = expected;
      const result = manager.getTaxAddress('');
      expect(result).toEqual(expected);
    });

    it('should return undefined if postalCode is not provided', () => {
      const expected = undefined;
      mockGetLocationData.mockReturnValue(
        CityResponseFactory({
          country: CountryRecordFactory(),
        })
      );
      const result = manager.getTaxAddress('');
      expect(result).toEqual(expected);
    });

    it('should return undefined if countryCode is not provided', () => {
      const expected = undefined;
      mockGetLocationData.mockReturnValue(
        CityResponseFactory({
          postal: PostalRecordFactory(),
        })
      );
      const result = manager.getTaxAddress('');
      expect(result).toEqual(expected);
    });

    it('should call reader if override postalCode is not provided', () => {
      mockConfig.locationOverride = { countryCode: 'ZA', postalCode: '' };
      manager.getTaxAddress('');
      expect(mockGetLocationData).toBeCalled();
    });

    it('should call reader if override countryCode is not provided', () => {
      mockConfig.locationOverride = { countryCode: '', postalCode: '12332' };
      manager.getTaxAddress('');
      expect(mockGetLocationData).toBeCalled();
    });

    it('should return undefined if no locationData is found', () => {
      const expected = undefined;
      mockGetLocationData.mockReturnValue(new Error('it failed'));
      const result = manager.getTaxAddress('');
      expect(result).toEqual(expected);
    });
  });
});
