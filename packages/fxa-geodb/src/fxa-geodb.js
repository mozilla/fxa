/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// these are defaults, can be overloaded by configuring options
var path = require('path');

var DEFAULT_DB_PATH = path.join(__dirname, '..', 'db', 'cities-db.mmdb');
var ERRORS = require('../lib/errors');
var maxmind = require('maxmind');
var Promise = require('bluebird');

module.exports = function (options) {
  'use strict';
  options = options || {};
  var dbPath = options.dbPath || DEFAULT_DB_PATH;

  var dbLookup, locationData;
  // we quit if the db did not load for some reason
  try {
    dbLookup = maxmind.open(dbPath);
  } catch (err) {
    // if it failed with primary database
    // then quit with error
    throw ERRORS.UNABLE_TO_FETCH_DATA;
  }

  return function (ip) {
    return new Promise(function (resolve, reject) {
      // check if ip is valid
      if (! maxmind.validate(ip)) {
        reject({
          message: ERRORS.IS_INVALID
        });
        return;
      }

      locationData = dbLookup.get(ip);

      if (locationData == null) {
        reject({
          message: ERRORS.UNABLE_TO_FETCH_DATA
        });
        return;
      }

      // return an object with city, country, continent,
      // latitude, and longitude, and timezone
      var location = new Location(locationData);

      resolve(location);
    });
  };
};

function Location(locationData) {
  if (locationData.location) {
    this.accuracy = locationData.location.accuracy_radius;
    this.latLong = {
      latitude: locationData.location.latitude,
      longitude: locationData.location.longitude
    };
    this.timeZone = locationData.location.time_zone;
  }

  if (locationData.city) {
    this.city = locationData.city.names.en;
  }

  if (locationData.continent) {
    this.continent = locationData.continent.names.en;
  }

  if (locationData.country) {
    this.country = locationData.country.names.en;
  }
}
