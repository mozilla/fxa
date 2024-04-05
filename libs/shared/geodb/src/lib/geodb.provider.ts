/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import fs from 'fs';
import { Provider } from '@nestjs/common';
import maxmind, { CityResponse, Reader } from 'maxmind';
import { GeodbConfig } from './geodb.config';
import path from 'path';

export type GeodbCityReader = Reader<CityResponse>;
export const GeodbProvider = Symbol('GeodbProvider');

function getGeodbPath(geodbConfig: GeodbConfig) {
  return path.resolve(geodbConfig.dbPath);
}

export async function setupGeodb(geodbPath: string) {
  return maxmind.open<CityResponse>(geodbPath);
}

export function setupGeodbSync(geodbPath: string) {
  const buffer = fs.readFileSync(geodbPath);
  return new Reader<CityResponse>(buffer);
}

export const GeodbNestFactory: Provider<GeodbCityReader> = {
  provide: GeodbProvider,
  useFactory: async (geodbConfig: GeodbConfig) => {
    const geodbPath = getGeodbPath(geodbConfig);
    return setupGeodb(geodbPath);
  },
  inject: [GeodbConfig],
};
