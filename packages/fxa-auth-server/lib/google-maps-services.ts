import {
  Client,
  GeocodeResult,
  PlaceType2,
  Status,
} from '@googlemaps/google-maps-services-js';
import * as Sentry from '@sentry/node';
import countries from 'i18n-iso-countries';
import { Container } from 'typedi';
import { AppConfig, AuthLogger } from './types';

export enum GoogleMapsServiceErrorType {
  ZERO_RESULTS = 'Could not find any results for address',
  NON_UNIQUE_RESULTS = 'Could not find unique results',
  GEOCODE_ERROR = '',
}

export class GoogleMapsServiceError extends Error {
  public address?: string;

  constructor(message: string, address?: string) {
    super();
    this.name = 'GoogleMapsServiceErrorType';
    this.message = message;
    if (address) this.address = address;
  }
}

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

  async getGeocodeResult(address: string): Promise<GeocodeResult> {
    try {
      const {
        data: { results, status, error_message: errorMessage },
      } = await this.client.geocode({
        params: {
          address,
          key: this.googleMapsApiKey,
        },
      });

      if (Status.ZERO_RESULTS)
        // throw new Error(`Could not find any results for address, ${address}`);
        throw new GoogleMapsServiceError(
          'Could not find any results for address',
          address
        );

      if (status !== Status.OK)
        throw new Error(
          `${
            errorMessage ? `${status} - ${errorMessage}` : `${status}`
          } for ${address}`
        );

      if (results.length > 1)
        throw new Error(
          `Could not find unique results for address, ${address}`
        );

      return results[0];
    } catch (error) {
      // If GoogleMapsServices returns anything other than OK, send to Sentry
      Sentry.withScope((scope) => {
        scope.setContext('googleMapsService', {
          address,
        });
        Sentry.captureMessage(error.message, Sentry.Severity.Error);
      });
      throw error;
    }
  }

  async getStateFromZip(zip: string, country: string): Promise<string> {
    const countryName = countries.getName(country, 'en');
    const address = `${zip}, ${countryName}`;

    try {
      if (!countryName)
        throw new Error(
          `Invalid country (${country}). Only ISO 3166-1 alpha-2 are supported.`
        );

      const { address_components: addressComponents } =
        await this.getGeocodeResult(address);

      const state = addressComponents.find((address) =>
        address.types.includes(PlaceType2.administrative_area_level_1)
      );
      if (!state?.short_name)
        throw new Error(`Could not find State for address, ${address}`);

      return state.short_name;
    } catch (error) {
      this.log.error('GoogleMapsServices.getLocationFromZip.failed', { error });
      throw error;
    }
  }
}
