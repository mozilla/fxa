/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const knownIpLocation = require('../known-ip-location');
const proxyquire = require('proxyquire');
const mockLog = require('../mocks').mockLog;
const modulePath = '../../lib/geodb';

describe('geodb', () => {
  it('returns location data when enabled', () => {
    const moduleMocks = {
      '../config': {
        default: {
          get: function (item) {
            if (item === 'geodb') {
              return {
                enabled: true,
                locationOverride: {},
              };
            }
          },
        },
      },
    };
    const thisMockLog = mockLog({});

    const getGeoData = proxyquire(modulePath, moduleMocks)(thisMockLog);
    const geoData = getGeoData(knownIpLocation.ip);
    assert.ok(knownIpLocation.location.city.has(geoData.location.city));
    assert.equal(geoData.location.country, knownIpLocation.location.country);
    assert.equal(
      geoData.location.countryCode,
      knownIpLocation.location.countryCode
    );
    assert.equal(geoData.timeZone, knownIpLocation.location.tz);
    assert.equal(geoData.location.state, knownIpLocation.location.state);
    assert.equal(
      geoData.location.stateCode,
      knownIpLocation.location.stateCode
    );
  });

  it('returns empty object data when disabled', () => {
    const moduleMocks = {
      '../config': {
        default: {
          get: function (item) {
            if (item === 'geodb') {
              return {
                enabled: false,
              };
            }
          },
        },
      },
    };
    const thisMockLog = mockLog({});

    const getGeoData = proxyquire(modulePath, moduleMocks)(thisMockLog);
    const geoData = getGeoData('8.8.8.8');
    assert.deepEqual(geoData, {});
  });
  it('passes userLocale to geodb and returns localized data', () => {
    const moduleMocks = {
      '../config': {
        default: {
          get: function (item) {
            if (item === 'geodb') {
              return {
                enabled: true,
                locationOverride: {},
              };
            }
          },
        },
      },
      'fxa-geodb': function (config) {
        return function (ip, options) {
          if (options && options.userLocale === 'fr') {
            return {
              city: 'Paris',
              country: 'France',
              countryCode: 'FR',
              accuracy: 10,
            };
          }
          return {
            city: 'Mountain View',
            country: 'United States',
            countryCode: 'US',
            accuracy: 10,
          };
        };
      },
    };
    const thisMockLog = mockLog({});

    const getGeoData = proxyquire(modulePath, moduleMocks)(thisMockLog);

    // Call with 'fr'
    const geoDataFr = getGeoData('8.8.8.8', 'fr');
    assert.equal(geoDataFr.location.country, 'France');
    assert.equal(geoDataFr.location.city, 'Paris');

    // Call with 'en' or undefined (defaults to mock else)
    const geoDataEn = getGeoData('8.8.8.8', 'en');
    assert.equal(geoDataEn.location.country, 'United States');
  });
});
