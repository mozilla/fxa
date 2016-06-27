/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const db = '../db/cities-db.mmdb';
const db_backup = '../db/cities-db.mmdb-backup';
const ERRORS = require('../lib/errors');
const maxmind = require('maxmind');
const Promise = require('bluebird');

function GeoDB(ip, time_stamp) {
  'use strict';
  time_stamp = time_stamp || new Date();

  // check if ip is valid
  if (! maxmind.validate(ip)) {
    return Promise.reject({
      message: ERRORS.IS_INVALID
    });
  }

  var city_lookup, city_data;
  // ip is valid, and in the right format,
  // try looking it up
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
      return Promise.reject({
        message: ERRORS.UNABLE_TO_FETCH_DATA
      });
    }
  }

  // return an object with city, country, continent,
  // latitude, and longitude,
  // and timezone (locale specific time also)
  return Promise.resolve({
    accuracy: city_data.location.accuracy_radius,
    city: city_data.city.names.en,
    continent: city_data.continent.names.en,
    country: city_data.country.names.en,
    ll: {
      latitude: city_data.location.latitude,
      longitude: city_data.location.longitude
    },
    time_zone: city_data.location.time_zone
  });
}

module.exports = GeoDB;
