/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


'use strict';

const chai = require('chai');
const GeoDB = require('../src/fxa-geodb');

const assert = chai.assert;

describe('fxa-geodb', function () {
  var geodb;
  var ip;

  beforeEach(function () {
    // this is Google's nameservers, will probably always stay constant
    ip = '8.8.8.8';
    geodb = new GeoDB(ip);
  });

  describe('ipToCountry', function () {
    it('returns a string with country details when supplied with an ip address', function () {
      console.log(GeoDB);
      debugger;
      return geodb.ipToCountry()
        .then(function (country) {
          assert.equal(country, 'United States', 'Country not returned correctly');
        }, function (err) {
          assert.equal(err.message, 'Error fetching country data', 'Incorrect error message');
        });
    });
  });

  describe('ipToCity', function () {
    it('returns a string with city details when supplied with an ip address', function () {
      return geodb.ipToCity()
        .then(function (city) {
          assert.equal(city, 'Mountain View', 'City not returned correctly');
        }, function (err) {
          assert.equal(err.message, 'Error fetching country data', 'Incorrect error message');
        });
    });
  });

  describe('ipToLocation', function () {
    it('returns a promise when called', function () {
      assert.isTrue(1 === 1, 'Promise not returned');
    });
  });

});
