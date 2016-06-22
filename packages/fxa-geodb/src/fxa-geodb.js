/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const db = '../db/GeoLite2-City.mmdb';
const maxmind = require('maxmind');

function GeoDB(ip) {
  'use strict';
  // if no ip is passed, return an error
  if (typeof ip !== 'string') {
    return
  }
  return {
    ipToCountry: function () {
      // this is the regular way of loading it
      var cityLookup = maxmind.open(db);
      var cityData = cityLookup.get(ip);
      return cityData.country;
      // we would be returning a promise here
      // should i use the `q` library? or native promises?
    }
  };
}

module.exports = GeoDB;
