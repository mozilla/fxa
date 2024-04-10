/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import maxmind from 'maxmind';
import { GeodbFetchDataFailed, GeodbInvalidIp } from './geodb.error';
import { GeodbCityReader } from './geodb.provider';

export function getLocationData(reader: GeodbCityReader, ip: string) {
  if (!maxmind.validate(ip)) {
    throw new GeodbInvalidIp();
  }

  const locationData = reader.get(ip);
  if (!locationData) {
    throw new GeodbFetchDataFailed();
  }

  return locationData;
}
