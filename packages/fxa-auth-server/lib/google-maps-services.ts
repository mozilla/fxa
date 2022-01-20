import {
  Client,
  GeocodeResponseData,
  GeocodeResult,
  PlaceType2,
  Status,
} from '@googlemaps/google-maps-services-js';
import * as Sentry from '@sentry/node';
import countries from 'i18n-iso-countries';
import { Container } from 'typedi';

import { AppConfig, AuthLogger } from './types';

export class GoogleMapsService {
  private log: AuthLogger;
  private client: Client;
  private googleMapsApiKey: string;

  constructor() {
    this.log = Container.get(AuthLogger);
    this.client = new Client();
    const config = Container.get(AppConfig);
    this.googleMapsApiKey = config.googleMapsApiKey;
  }

  /**
   * Retrieve Geocode Data for the specified address. For more information review
   * https://developers.google.com/maps/documentation/geocoding/overview
   */
  private async getGeocodeData(address: string): Promise<GeocodeResponseData> {
    try {
      const { data } = await this.client.geocode({
        params: {
          address,
          key: this.googleMapsApiKey,
        },
      });

      const { status, error_message: errorMessage } = data;

      if ([Status.OK, Status.ZERO_RESULTS].includes(status)) return data;

      throw new Error(
        `${status}${errorMessage && ` - ${errorMessage}`}. (${address})`
      );
    } catch (error) {
      // If GoogleMapsServices returns anything other than OK or ZERO_RESULTS, send to Sentry
      Sentry.withScope((scope) => {
        scope.setContext('googleMapsService', {
          address,
        });
        Sentry.captureMessage(error.message, Sentry.Severity.Error);
      });
      throw error;
    }
  }

  /**
   * Retrieve a unique GeocodeResult for a given address.
   */
  private async getOneGeocodeResult(address: string): Promise<GeocodeResult> {
    const { results, status } = await this.getGeocodeData(address);

    if (status === Status.ZERO_RESULTS)
      throw new Error(`Could not find any results for address. (${address})`);

    if (results.length > 1) {
      const stateShortNames = results.map(
        (result) =>
          result.address_components.find((addressComponent) =>
            addressComponent.types.includes(
              PlaceType2.administrative_area_level_1
            )
          )?.short_name
      );
      // Check if the state short names match for each result
      const states = new Set(stateShortNames);
      if (states.size === 1) {
        return results[0];
      } else {
        throw new Error(`Could not find unique results. (${address})`);
      }
    }

    return results[0];
  }

  /**
   * Retrieve State Code from Zip and Country Code.
   * Country Code is required as ISO-3166-1 alpha-2 codes
   * State codes are returned as ISO-3166-2 codes
   */
  async getStateFromZip(zip: string, country: string): Promise<string> {
    const countryName = countries.getName(country, 'en');
    // Address format should be in accordance with the format used by the national postal service of the country.
    // For more information review https://developers.google.com/maps/documentation/geocoding/overview
    const address = `${zip}, ${countryName}`;

    try {
      if (!countryName)
        throw new Error(
          `Invalid country (${country}). Only ISO 3166-1 alpha-2 country codes are supported.`
        );

      const { address_components: addressComponents } =
        await this.getOneGeocodeResult(address);

      const state = addressComponents.find((address) =>
        address.types.includes(PlaceType2.administrative_area_level_1)
      );
      if (!state?.short_name)
        throw new Error(`State could not be found. (${address})`);

      return state.short_name;
    } catch (error) {
      this.log.error('GoogleMapsServices.getStateFromZip.failed', {
        error,
        zip,
        country,
      });
      throw error;
    }
  }
}
