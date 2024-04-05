import { faker } from '@faker-js/faker';
import { CityResponse } from 'maxmind';
import {
  CityRecord,
  ContinentRecord,
  CountryRecord,
  LocationRecord,
  PostalRecord,
  RegisteredCountryRecord,
  RepresentedCountryRecord,
  SubdivisionRecord,
  TraitsRecord,
} from './maxmind.types';

/**
 * Names Fatories
 */
export const ContinentRecordNamesFactory = (
  override?: Partial<ContinentRecord['names']>
): ContinentRecord['names'] => ({
  en: faker.helpers.arrayElement([
    'Africa',
    'Antarctica',
    'Asia',
    'Europe',
    'North America',
    'Australia',
    'South America',
  ]),
  ...override,
});

export const RegisteredCountryRecordNamesFactory = (
  override?: Partial<RegisteredCountryRecord['names']>
): RegisteredCountryRecord['names'] => ({
  en: faker.location.country(),
  ...override,
});

export const SubdivisionsRecordNamesFactory = (
  override?: Partial<SubdivisionRecord['names']>
): SubdivisionRecord['names'] => ({
  en: faker.location.state(),
  ...override,
});

export const CityRecordNamesFactory = (
  override?: Partial<CityRecord['names']>
): CityRecord['names'] => ({
  en: faker.location.city(),
  ...override,
});

/**
 * Record Factories
 */
export const ContinentRecordFactory = (
  override?: Partial<ContinentRecord>
): ContinentRecord => ({
  code: faker.helpers.arrayElement(['AF', 'AN', 'AS', 'EU', 'NA', 'OC', 'SA']),
  geoname_id: faker.number.int(1000),
  names: CityRecordNamesFactory(),
  ...override,
});

export const CountryRecordFactory = (
  override?: Partial<CountryRecord>
): CountryRecord => ({
  ...RegisteredCountryRecordFactory(),
  ...override,
});

export const RegisteredCountryRecordFactory = (
  override?: Partial<RegisteredCountryRecord>
): RegisteredCountryRecord => ({
  geoname_id: faker.number.int(1000),
  iso_code: faker.location.countryCode(),
  names: RegisteredCountryRecordNamesFactory(),
  ...override,
});

export const RepresentedCountryRecordFactory = (
  override?: Partial<RepresentedCountryRecord>
): RepresentedCountryRecord => ({
  type: faker.string.alpha({ length: { min: 5, max: 5 } }),
  ...RegisteredCountryRecordFactory(),
  ...override,
});

export const TraitsRecordFactory = (
  override?: Partial<TraitsRecord>
): TraitsRecord => ({
  ...override,
});

export const CityRecordFactory = (
  override?: Partial<CityRecord>
): CityRecord => ({
  geoname_id: faker.number.int(1000),
  names: CityRecordNamesFactory(),
  ...override,
});

export const LocationRecordFactory = (
  override?: Partial<LocationRecord>
): LocationRecord => ({
  accuracy_radius: faker.number.int(1000),
  latitude: faker.location.latitude(),
  longitude: faker.location.longitude(),
  ...override,
});

export const PostalRecordFactory = (
  override?: Partial<PostalRecord>
): PostalRecord => ({
  code: faker.location.zipCode(),
  ...override,
});

export const SubdivisionsRecordFactory = (
  override?: Partial<SubdivisionRecord>
): SubdivisionRecord => ({
  geoname_id: faker.number.int(1000),
  iso_code: faker.location.countryCode(),
  names: SubdivisionsRecordNamesFactory(),
  ...override,
});

export const CityResponseFactory = (
  override?: Partial<CityResponse>
): CityResponse => ({
  ...override,
});
