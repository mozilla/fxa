/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// `./geodb` captures the config object by reference at module load, so
// per-test variation must mutate properties, not reassign the variable.
const geodbConfig: { enabled: boolean; locationOverride: any } = {
  enabled: true,
  locationOverride: {},
};

jest.mock('../config', () => ({
  default: {
    get: function (item: string) {
      if (item === 'geodb') {
        return geodbConfig;
      }
      return undefined;
    },
  },
}));

import knownIpLocation from '../test/known-ip-location';
import geodbFactory from './geodb';

function mockLog() {
  return {
    info: jest.fn(),
    trace: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };
}

describe('geodb', () => {
  beforeEach(() => {
    geodbConfig.enabled = true;
    geodbConfig.locationOverride = {};
  });

  it('returns location data when enabled', () => {
    const getGeoData = geodbFactory(mockLog());
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
    geodbConfig.enabled = false;

    const getGeoData = geodbFactory(mockLog());
    const geoData = getGeoData('8.8.8.8');

    expect(geoData).toEqual({});
  });
});
