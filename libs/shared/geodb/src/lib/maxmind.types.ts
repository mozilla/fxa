/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
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
