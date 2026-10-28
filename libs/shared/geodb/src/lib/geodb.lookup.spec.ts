/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import path from 'path';
import { CityResponse } from 'maxmind';
import { GeoDBFetchDataFailed, GeoDBInvalidIp } from './geodb.error';
import { Location } from './geodb.location';
import { createGeoDBLookup } from './geodb.lookup';

const dbPath = path.resolve(__dirname, '../../db/cities-db.mmdb');

describe('createGeoDBLookup', () => {
  const lookup = createGeoDBLookup(dbPath);

  it('throws when the database file does not exist', () => {
    expect(() => createGeoDBLookup('completely-not-there.mmdb')).toThrow();
  });

  it('throws GeoDBInvalidIp for an invalid ip', () => {
    expect(() => lookup('not-an-ip')).toThrow(GeoDBInvalidIp);
  });

  it('throws GeoDBFetchDataFailed when no data is available', () => {
    expect(() => lookup('127.0.0.1')).toThrow(GeoDBFetchDataFailed);
  });

  it('returns location data for a known ip', () => {
    expect(lookup('63.245.221.32')).toMatchObject({
      city: 'Mountain View',
      continent: 'North America',
      country: 'United States',
      countryCode: 'US',
      latLong: { latitude: 37.3897, longitude: -122.0832 },
      timeZone: 'America/Los_Angeles',
    });
  });

  it('falls back to English names for a locale the database lacks', () => {
    expect(lookup('63.245.221.32', { userLocale: 'xx' }).country).toBe(
      'United States'
    );
  });

  it('builds a Location with partial data when the city is unknown', () => {
    const location = new Location(
      {
        country: { iso_code: 'US', names: { en: 'United States' } },
        location: { time_zone: 'America/Chicago' },
      } as CityResponse,
      'en'
    );
    expect(location.city).toBeUndefined();
    expect(location.countryCode).toBe('US');
    expect(location.timeZone).toBe('America/Chicago');
  });
});
