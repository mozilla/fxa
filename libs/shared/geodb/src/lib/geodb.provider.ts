/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import fs from 'fs';
import { Provider } from '@nestjs/common';
import maxmind, { CityResponse, Reader } from 'maxmind';
import { GeoDBConfig } from './geodb.config';
import path from 'path';

export type GeoDBCityReader = Reader<CityResponse>;
export const GeoDBProvider = Symbol('GeoDBProvider');

function getGeoDBPath(geodbConfig: GeoDBConfig) {
  return path.resolve(geodbConfig.dbPath);
}

export async function setupGeoDB(geodbPath: string) {
  return maxmind.open<CityResponse>(geodbPath);
}

export function setupGeoDBSync(geodbPath: string) {
  const buffer = fs.readFileSync(geodbPath);
  return new Reader<CityResponse>(buffer);
}

export const GeoDBNestFactory: Provider<GeoDBCityReader> = {
  provide: GeoDBProvider,
  useFactory: async (geodbConfig: GeoDBConfig) => {
    const geodbPath = getGeoDBPath(geodbConfig);
    return setupGeoDB(geodbPath);
  },
  inject: [GeoDBConfig],
};
