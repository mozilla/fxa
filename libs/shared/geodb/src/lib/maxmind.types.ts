import { CityResponse, CountryResponse } from 'maxmind';

type GetElementType<T extends any[]> = T extends (infer U)[] ? U : never;

export type CityRecord = NonNullable<CityResponse['city']>;
export type LocationRecord = NonNullable<CityResponse['location']>;
export type PostalRecord = NonNullable<CityResponse['postal']>;
export type SubdivisionRecord = GetElementType<
  NonNullable<CityResponse['subdivisions']>
>;
export type ContinentRecord = NonNullable<CountryResponse['continent']>;
export type CountryRecord = NonNullable<CountryResponse['country']>;
export type RegisteredCountryRecord = NonNullable<
  CountryResponse['registered_country']
>;
export type RepresentedCountryRecord = NonNullable<
  CountryResponse['represented_country']
>;
export type TraitsRecord = NonNullable<CountryResponse['traits']>;
