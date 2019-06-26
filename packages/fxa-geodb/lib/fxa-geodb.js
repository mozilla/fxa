/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var DEFAULTS = require('./defaults');
var ERRORS = require('./errors');
var maxmind = require('maxmind');
var Location = require('./location');

module.exports = function(options) {
  'use strict';

  options = options || {};
  var dbPath = options.dbPath || DEFAULTS.DB_PATH;

  const dbLookup = maxmind.openSync(dbPath);

  return (ip, options = {}) => {
    const userLocale = options.userLocale || DEFAULTS.USER_LOCALE;

    // check if ip is valid
    if (!maxmind.validate(ip)) {
      throw new Error(ERRORS.IS_INVALID);
    }

    const locationData = dbLookup.get(ip);
    if (locationData == null) {
      throw new Error(ERRORS.UNABLE_TO_FETCH_DATA);
    }

    // return an object with city, country, continent,
    // latitude, and longitude, and timezone
    return new Location(locationData, userLocale);
  };
};
