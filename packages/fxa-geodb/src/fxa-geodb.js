/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const db = '../db/GeoLite2-City.mmdb';
const maxmind = require('maxmind');
const ERRORS = require('./errors');
const Promise = require('bluebird');

function GeoDB(ip) {
  'use strict';

  // if no ip is passed, return an error object
  if (typeof ip === 'undefined') {
    return Promise.reject({
      message: ERRORS.IS_UNDEFINED
    });
  }

  // ip not a string, return an error object
  if (typeof ip !== 'string') {
    return Promise.reject({
      message: ERRORS.NOT_A_STRING
    });
  }

  // ip is empty, return an error object
  if (ip.length === 0) {
    return Promise.reject({
      message: ERRORS.IS_EMPTY
    });
  }

  // at this point, we know ip is a string and is
  // non-empty, we can validate it
  if (! maxmind.validate(ip)) {
    return Promise.reject({
      message: ERRORS.IS_INVALID
    });
  }

  // ip is valid, and in the right format,
  // try looking it up
  try {
    var cityLookup = maxmind.open(db);
    var cityData = cityLookup.get(ip);
  } catch (err) {
    return Promise.reject({
      message: ERRORS.UNABLE_TO_FETCH_DATA
    });
  }

  // return an object with city, country, continent,
  // latitude, and longitude,
  // and timezone (locale specific time also)
  return Promise.resolve({
    country: cityData.country.names.en,
    city: cityData.city.names.en,
    continent: cityData.continent.names.en,
    ll: {
      latitude: cityData.location.latitude,
      longitude: cityData.location.longitude
    },
    time_zone: cityData.location.time_zone,
    local_time: new Date().toLocaleString('en', {timeZone: cityData.location.time_zone}),
    // can remove this if not required
    cityData: cityData
  });
}

module.exports = GeoDB;
