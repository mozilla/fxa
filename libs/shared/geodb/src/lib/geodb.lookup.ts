/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { DEFAULT_LOCALE } from '@fxa/shared/l10n';
import { Location } from './geodb.location';
import { setupGeoDBSync } from './geodb.provider';
import { getLocationData } from './geodb.repository';

export type GeoDBLookup = (
  ip: string,
  options?: { userLocale?: string }
) => Location;

/**
 * Loads the database synchronously and returns an IP to Location lookup.
 * Throws GeoDBInvalidIp or GeoDBFetchDataFailed on lookup.
 */
export function createGeoDBLookup(dbPath: string): GeoDBLookup {
  const reader = setupGeoDBSync(dbPath);
  return (ip, options = {}) =>
    new Location(
      getLocationData(reader, ip),
      options.userLocale || DEFAULT_LOCALE
    );
}
