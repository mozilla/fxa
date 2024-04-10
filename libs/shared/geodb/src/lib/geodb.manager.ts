/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Inject, Injectable } from '@nestjs/common';
import { GeodbProvider } from './geodb.provider';
import type { GeodbCityReader } from './geodb.provider';
import { getLocationData } from './geodb.repository';
import { GeodbManagerConfig } from './geodb.config';
import { TaxAddress } from './geodb.types';

Injectable();
export class GeodbManager {
  constructor(
    @Inject(GeodbProvider) private reader: GeodbCityReader,
    private config: GeodbManagerConfig
  ) {}

  getTaxAddress(ip: string): TaxAddress | undefined {
    const { locationOverride } = this.config;
    if (locationOverride.countryCode && locationOverride.postalCode) {
      return {
        countryCode: locationOverride.countryCode,
        postalCode: locationOverride.postalCode,
      };
    }

    try {
      const locationData = getLocationData(this.reader, ip);
      const countryCode = locationData.country?.iso_code;
      const postalCode = locationData.postal?.code;
      if (!countryCode || !postalCode) {
        return;
      } else {
        return {
          countryCode,
          postalCode,
        };
      }
    } catch (error) {
      return;
    }
  }
}
