/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// these are defaults, can be overloaded by configuring options
var db = __dirname + '/../db/cities-db.mmdb';
var db_backup = __dirname + '/../db/cities-db.mmdb-backup';
var ERRORS = require('../lib/errors');
var maxmind = require('maxmind');
var Promise = require('bluebird');

module.exports = function (options) {
  'use strict';
  options = options || {};
  db = options.db || db;
  db_backup = options.db_backup || db_backup;

  return function (ip) {
    return new Promise(function (resolve, reject) {
      // check if ip is valid
      if (!maxmind.validate(ip)) {
        reject({
          message: ERRORS.IS_INVALID
        });
      }

      var city_lookup, city_data;
      // ip is valid, try looking it up
      // the nested try..catch is to ensure that
      // we always have at least one valid database check
      // this can help when we have `db` as paid and
      // `db_backup` as free version or when `db` fails
      // to load for some reason
      try {
        city_lookup = maxmind.open(db);
        city_data = city_lookup.get(ip);
      } catch (err) {
        // if it failed with primary database,
        // try with backup database
        try {
          city_lookup = maxmind.open(db_backup);
          city_data = city_lookup.get(ip);
        } catch (err) {
          // if that fails, then return a reject
          reject({
            message: ERRORS.UNABLE_TO_FETCH_DATA
          });
        }
      }

      if (city_data == null) {
        reject({
          message: ERRORS.UNABLE_TO_FETCH_DATA
        });
      }

      // return an object with city, country, continent,
      // latitude, and longitude, and timezone
      var location = new function () {
        if (city_data.location) {
          this.accuracy = city_data.location.accuracy_radius;
          this.ll = {
            latitude: city_data.location.latitude,
            longitude: city_data.location.longitude
          };
          this.time_zone = city_data.location.time_zone;
        }

        if (city_data.city) {
          this.city = city_data.city.names.en;
        }

        if (city_data.continent) {
          this.continent = city_data.continent.names.en;
        }

        if (city_data.country) {
          this.country = city_data.country.names.en;
        }
        this.city_data = city_data;
      };
      resolve(location);
    });
  };
};
