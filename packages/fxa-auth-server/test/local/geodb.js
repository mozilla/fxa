/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var tap = require('tap')
var proxyquire = require('proxyquire')
var test = tap.test
var mockLog = require('../mocks').mockLog

test(
  'returns location data when enabled',
  function (t) {
    var moduleMocks = {
      '../config': {
        'get': function (item) {
          if (item === 'geodb') {
            return {
              enabled: true
            }
          }
        }
      }
    }
    var thisMockLog = mockLog({})

    var getGeoData = proxyquire('../../lib/geodb', moduleMocks)(thisMockLog)
    getGeoData('8.8.8.8')
    .then(function (geoData) {
      t.equal(geoData.location.city, 'Mountain View')
      t.equal(geoData.location.country, 'United States')
      t.equal(geoData.timeZone, 'America/Los_Angeles')
      t.end()
    })
  }
)

test(
  'returns empty object data when disabled',
  function (t) {
    var moduleMocks = {
      '../config': {
        'get': function (item) {
          if (item === 'geodb') {
            return {
              enabled: false
            }
          }
        }
      }
    }
    var thisMockLog = mockLog({})

    var getGeoData = proxyquire('../../lib/geodb', moduleMocks)(thisMockLog)
    getGeoData('8.8.8.8')
    .then(function (geoData) {
      t.deepEqual(geoData, {})
      t.end()
    })
  }
)
