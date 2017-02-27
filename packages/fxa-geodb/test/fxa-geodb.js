/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var chai = require('chai');
var DEFAULTS = require('../lib/defaults');
var ERRORS = require('../lib/errors');
var geoDb;

var assert = chai.assert;

describe('fxa-geodb', function () {
  'use strict';
  var ip;
  beforeEach(function () {
    geoDb = require('../lib/fxa-geodb')();
  });

  it('returns a promise when called', function () {
    assert.isFunction(geoDb('12.23.34.45').then, 'Promise returned');
  });

  it('returns an error object with `UNABLE_TO_OPEN_FILE` when supplied with an non-existent file', function () {
    ip = '8.8.8.8';
    geoDb = require('../lib/fxa-geodb')({
      dbPath: 'completely-not-there.mmdb'
    });
    return geoDb(ip)
      .catch(function (err) {
        assert.equal(err.message, ERRORS.UNABLE_TO_OPEN_FILE, 'Invalid error message');
      });
  });

  it('returns an error object with `IS_INVALID` when supplied with an undefined ip variable', function () {
    return geoDb(ip)
      .catch(function (err) {
        assert.equal(err.message, ERRORS.IS_INVALID, 'Invalid error message');
      });
  });

  it('returns an error object with `IS_INVALID` when supplied with an object', function () {
    ip = {};
    return geoDb(ip)
      .catch(function (err) {
        assert.equal(err.message, ERRORS.IS_INVALID, 'Invalid error message');
      });
  });

  it('returns an error object with `IS_INVALID` when supplied with an empty ip', function () {
    ip = '';
    return geoDb(ip)
      .catch(function (err) {
        assert.equal(err.message, ERRORS.IS_INVALID, 'Invalid error message');
      });
  });

  it('returns an error object with `IS_INVALID` when supplied with an invalid ip', function () {
    ip = '5.6.7';
    return geoDb(ip)
      .catch(function (err) {
        assert.equal(err.message, ERRORS.IS_INVALID, 'Invalid error message');
      });
  });

  it('returns an object with location data when supplied with a valid ip address', function () {
    ip = DEFAULTS.GEODB_TEST_IP;
    var latLong = {
      latitude: 37.386,
      longitude: -122.0838
    };
    return geoDb(ip)
      .then(function (location) {
        assert.equal(location.country, 'United States', 'Country returned correctly');
        assert.equal(location.countryCode, 'US', 'Country code returned correctly');
        assert.equal(location.city, 'Mountain View', 'City returned correctly');
        assert.equal(location.continent, 'North America', 'Continent returned correctly');
        assert.deepEqual(location.latLong, latLong, 'LatLong returned correctly');
        assert.equal(location.timeZone, 'America/Los_Angeles', 'Timezone returned correctly');
      }, function (err) {
        assert.equal(err.message, ERRORS.UNABLE_TO_FETCH_DATA, 'Invalid error message');
      });
  });

  it('returns an Error Object when no data is available', function () {
    // 127.0.0.1 is localhost, will always return no data
    ip = '127.0.0.1';
    return geoDb(ip)
      .catch(function (err) {
        assert.equal(err.message, ERRORS.UNABLE_TO_FETCH_DATA, 'Invalid error message');
      });
  });

  it('returns an object with partial location data when complete data is not available', function () {
    // 64.11.221.194 is an unassigned IP in North America, will probably return incomplete data
    // time_zone and city should be undefined, while country would be USA
    ip = '64.11.221.194';
    return geoDb(ip)
      .then(function (location) {
        assert.equal(location.country, 'United States', 'Country returned correctly');
        assert.equal(location.countryCode, 'US', 'Country code returned correctly');
        assert.equal(typeof location.city, 'undefined', 'City undefined');
        assert.equal(location.continent, 'North America', 'Continent returned correctly');
        assert.equal(typeof location.timeZone, 'undefined', 'Timezone undefined');
      }, function (err) {
        assert.equal(err.message, ERRORS.UNABLE_TO_FETCH_DATA, 'Invalid error message');
      });
  });

});
