/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export const MOCK_LOCATION_TRUNCATED = {
  device: 'Firefox on Mac OSX 10.11',
  ip: '10.246.67.38',
  location: 'Madrid, Spain (estimated)',
};

export const MOCK_LOCATION = {
  date: 'Thursday, Sep 2, 2021',
  ...MOCK_LOCATION_TRUNCATED,
  time: '12:26:44 AM (CEST)',
};

export const MOCK_LOCATION_ALL = {
  primaryEmail: 'primaryFoo@bar.com',
  ...MOCK_LOCATION,
}
