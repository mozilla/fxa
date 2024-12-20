/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import {
  GeocodeResult,
  LocationType,
  PlaceType2,
} from '@googlemaps/google-maps-services-js';

export const GeocodeResultFactory = (
  override?: Partial<GeocodeResult>
): GeocodeResult => ({
  types: [] as PlaceType2[],
  formatted_address: faker.location.streetAddress(),
  address_components: [
    {
      long_name: faker.location.city(),
      short_name: faker.location.city(),
      types: [] as PlaceType2[],
    },
  ],
  postcode_localities: [faker.location.city()],
  geometry: {
    location: {
      lat: faker.location.latitude(),
      lng: faker.location.longitude(),
    },
    location_type: 'rooftop' as LocationType,
    viewport: {
      northeast: {
        lat: faker.location.latitude(),
        lng: faker.location.longitude(),
      },
      southwest: {
        lat: faker.location.latitude(),
        lng: faker.location.longitude(),
      },
    },
  },
  plus_code: {
    compound_code: faker.string.uuid(),
    global_code: faker.string.uuid(),
  },
  partial_match: faker.datatype.boolean(),
  place_id: faker.string.uuid(),
  ...override,
});
