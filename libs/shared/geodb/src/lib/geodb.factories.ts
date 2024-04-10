/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { faker } from '@faker-js/faker';
import { TaxAddress } from './geodb.types';
import { GeodbManagerConfig } from './geodb.config';

export const TaxAddressFactory = (
  override?: Partial<TaxAddress>
): TaxAddress => ({
  countryCode: faker.location.countryCode(),
  postalCode: faker.location.zipCode(),
  ...override,
});

export const LocationOverrideFactory = TaxAddressFactory;

export const GeodbManagerConfigFactory = (
  override?: Partial<GeodbManagerConfig>
): GeodbManagerConfig => ({
  locationOverride: LocationOverrideFactory(),
  ...override,
});
