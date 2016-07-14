/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var DEFAULTS = require('../lib/defaults');
var ERRORS = require('../lib/errors');
var maxmind = require('maxmind');
var Promise = require('bluebird');

module.exports = function (options) {
  'use strict';

  options = options || {};
  var dbPath = options.dbPath || DEFAULTS.DEFAULT_DB_PATH;

  var dbLookup;
  // we quit if the db did not load for some reason
  try {
    dbLookup = maxmind.open(dbPath);
  } catch (err) {
    // if it failed with primary database
    // then quit with error
    throw ERRORS.UNABLE_TO_FETCH_DATA;
  }

  return function (ip, options) {
    options = options || {};
    var userLocale = options.userLocale || 'en';
    return new Promise(function (resolve, reject) {
      // check if ip is valid
      if (! maxmind.validate(ip)) {
        return reject({
          message: ERRORS.IS_INVALID
        });
      }

      var locationData = dbLookup.get(ip);

      if (locationData == null) {
        return reject({
          message: ERRORS.UNABLE_TO_FETCH_DATA
        });
      }

      // return an object with city, country, continent,
      // latitude, and longitude, and timezone
      var location = new Location(locationData, userLocale);

      resolve(location);
    });
  };
};

function Location(locationData, userLocale) {
  'use strict';

  if (locationData.location) {
    this.accuracy = locationData.location.accuracy_radius;
    this.latLong = {
      latitude: locationData.location.latitude,
      longitude: locationData.location.longitude
    };
    this.timeZone = locationData.location.time_zone;
  }

  this.getLocaleSpecificLocationString = function (locationObject, userLocale) {
    // if we have the user's locale specific name, return that,
    // else return 'en' - english.
    return locationObject.names[userLocale] || locationObject.names['en'];
  };

  if (locationData.city) {
    this.city = this.getLocaleSpecificLocationString(locationData.city, userLocale);
  }

  if (locationData.continent) {
    this.continent = this.getLocaleSpecificLocationString(locationData.continent, userLocale);
  }

  if (locationData.country) {
    this.country = this.getLocaleSpecificLocationString(locationData.country, userLocale);
  }

  //if (locationData.subdivisions) {
  //  this.state =
  //}
}
