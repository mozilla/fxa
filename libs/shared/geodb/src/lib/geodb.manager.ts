import { Inject, Injectable } from '@nestjs/common';
import { GeodbProvider } from './geodb.provider';
import type { GeodbCityReader } from './geodb.provider';
import { getLocationData } from './geodb.repository';
import { GeodbManagerConfig } from './geodb.config';

Injectable();
export class GeodbManager {
  constructor(
    @Inject(GeodbProvider) private reader: GeodbCityReader,
    private config: GeodbManagerConfig
  ) {}

  getTaxAddress(ip: string) {
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
