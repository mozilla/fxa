import { CityResponse } from 'maxmind';
import { DEFAULT_LOCALE } from '@fxa/shared/l10n';

export class Location {
  accuracy?: number;
  latLong?: {
    latitude: number;
    longitude: number;
  };
  timeZone?: string;
  city?: string;
  continent?: string;
  country?: string;
  countryCode?: string;
  state?: string;
  stateCode?: string;
  postalCode?: string;

  constructor(locationData: CityResponse, userLocale: string) {
    if (locationData.location) {
      this.accuracy = locationData.location.accuracy_radius;
      this.latLong = {
        latitude: locationData.location.latitude,
        longitude: locationData.location.longitude,
      };
      this.timeZone = locationData.location.time_zone;
    }

    if (locationData.city) {
      this.city = this.getLocaleSpecificLocationString(
        locationData.city,
        userLocale
      );
    }

    if (locationData.continent) {
      this.continent = this.getLocaleSpecificLocationString(
        locationData.continent,
        userLocale
      );
    }

    if (locationData.country) {
      this.country = this.getLocaleSpecificLocationString(
        locationData.country,
        userLocale
      );
      this.countryCode = locationData.country.iso_code;
    }

    if (locationData.subdivisions) {
      this.state = this.getLocaleSpecificLocationString(
        locationData.subdivisions[0],
        userLocale
      );
      this.stateCode =
        locationData.subdivisions[0] && locationData.subdivisions[0].iso_code;
    }

    if (locationData.postal) {
      this.postalCode = locationData.postal.code;
    }
  }

  private getLocaleSpecificLocationString(
    locationObject: any,
    userLocale: string
  ) {
    // if we have the user's locale specific name, return that,
    // else return 'en' - english.
    return (
      locationObject.names[userLocale] || locationObject.names[DEFAULT_LOCALE]
    );
  }
}
