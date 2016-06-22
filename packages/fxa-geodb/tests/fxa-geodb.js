/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const chai = require('chai');
const GeoDB = require('../src/fxa-geodb');

const assert = chai.assert;

describe('fxa-geodb', function () {
  'use strict';
  var ip;

  beforeEach(function () {
    // this is Google's nameservers, will probably always stay constant
  });


  it('returns an object with location details when supplied with a valid ip address', function () {
    ip = '8.8.8.8';
    return GeoDB(ip)
      .then(function (location) {
        assert.equal(location.country, 'United States', 'Country not returned correctly');
      }, function (err) {
        assert.equal(err.message, 'Error fetching country data', 'Incorrect error message');
      });
  });

});
