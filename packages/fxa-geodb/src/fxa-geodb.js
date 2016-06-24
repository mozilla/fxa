/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const db = '../db/cities-db.mmdb';
const db_backup = '../db/cities-db.mmdb-backup';
const ERRORS = require('../lib/errors');
const Joi = require('joi');
const maxmind = require('maxmind');
const Promise = require('bluebird');

function GeoDB(ip, time_stamp) {
  'use strict';
  time_stamp = time_stamp || new Date();

  // allows us to check whether the ip is defined, is a string, and is not empty
  var schema = Joi.object().keys({
    IP: Joi.string().required()
  });
  var err = Joi.validate({IP: ip}, schema);
  if (err.error) {
    return Promise.reject({
      message: err.error.details[0].message
    });
  }

  // at this point, we know ip is a string and is
  // non-empty, we can validate it
  if (! maxmind.validate(ip)) {
    return Promise.reject({
      message: ERRORS.IS_INVALID
    });
  }

  var cityLookup, cityData;
  // ip is valid, and in the right format,
  // try looking it up
  // the nested try..catch is to ensure that
  // we always have at least one valid database check
  // this can help when we have `db` as paid and
  // `db_backup` as free version or when `db` fails
  // to load for some reason
  try {
    cityLookup = maxmind.open(db);
    cityData = cityLookup.get(ip);
  } catch (err) {
    // if it failed with primary database,
    // try with backup database
    try {
      cityLookup = maxmind.open(db_backup);
      cityData = cityLookup.get(ip);
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
    accuracy: cityData.location.accuracy_radius,
    city: cityData.city.names.en,
    continent: cityData.continent.names.en,
    country: cityData.country.names.en,
    local_time: new Date(time_stamp).toLocaleString('en', {timeZone: cityData.location.time_zone}),
    ll: {
      latitude: cityData.location.latitude,
      longitude: cityData.location.longitude
    },
    time_zone: cityData.location.time_zone,
    // can remove this if not required
    cityData: cityData
  });
}

module.exports = GeoDB;
