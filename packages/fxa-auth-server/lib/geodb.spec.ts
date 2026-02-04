/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sinon from 'sinon';

const knownIpLocation = require('../test/known-ip-location');

function mockLog() {
  return {
    info: sinon.stub(),
    trace: sinon.stub(),
    error: sinon.stub(),
    warn: sinon.stub(),
    debug: sinon.stub(),
  };
}

describe('geodb', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('returns location data when enabled', () => {
    jest.doMock('../config', () => ({
      default: {
        get: function (item: string) {
          if (item === 'geodb') {
            return {
              enabled: true,
              locationOverride: {},
            };
          }
          return undefined;
        },
      },
    }));

    const thisMockLog = mockLog();
    const getGeoData = require('./geodb')(thisMockLog);
    const geoData = getGeoData(knownIpLocation.ip);

    expect(knownIpLocation.location.city.has(geoData.location.city)).toBe(true);
    expect(geoData.location.country).toBe(knownIpLocation.location.country);
    expect(geoData.location.countryCode).toBe(
      knownIpLocation.location.countryCode
    );
    expect(geoData.timeZone).toBe(knownIpLocation.location.tz);
    expect(geoData.location.state).toBe(knownIpLocation.location.state);
    expect(geoData.location.stateCode).toBe(knownIpLocation.location.stateCode);
  });

  it('returns empty object data when disabled', () => {
    jest.doMock('../config', () => ({
      default: {
        get: function (item: string) {
          if (item === 'geodb') {
            return {
              enabled: false,
            };
          }
          return undefined;
        },
      },
    }));

    const thisMockLog = mockLog();
    const getGeoData = require('./geodb')(thisMockLog);
    const geoData = getGeoData('8.8.8.8');

    expect(geoData).toEqual({});
  });
});
