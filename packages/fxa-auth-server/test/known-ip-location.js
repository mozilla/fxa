/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

module.exports = {
  // This is a known IP address and its expected location.
  //
  // For `city`, results have fluctuated sufficiently that
  // we decided not to do direct assertions in the tests.
  // Instead we assert that the result matches one of the
  // expected locations.
  //
  // If you are from the future and the cities listed here
  // do not include what's being reported in your time, feel
  // free to add it to the set. :)
  ip: '63.245.221.32',
  location: {
    city: new Set([
      'Mountain View',

      // Add new cities below here
      'Oakland',
      'San Francisco',
      'San Jose',
      'Santa Clara',
      'Fairfield',
    ]),
    country: 'United States',
    countryCode: 'US',
    state: 'California',
    stateCode: 'CA',
    tz: 'America/Los_Angeles',
  },
};
