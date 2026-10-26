/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export const MOCK_LOCATION_STATE_COUNTRY = {
  stateCode: 'CA',
  country: 'United States',
};

export const MOCK_LOCATION_ALL = {
  city: 'Mountain View',
  ...MOCK_LOCATION_STATE_COUNTRY,
};

export const MOCK_LOCATION_COUNTRY = {
  country: 'Spain',
};

export const MOCK_LOCATION_CITY_COUNTRY = {
  city: 'Madrid',
  ...MOCK_LOCATION_COUNTRY,
};
