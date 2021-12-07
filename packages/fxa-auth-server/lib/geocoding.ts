import {
  Client,
  PlaceType2,
  Status,
} from '@googlemaps/google-maps-services-js';
import countries from 'i18n-iso-countries';
import { ConfigType } from '../config';
import { Logger } from 'mozlog';
import { Container } from 'typedi';

export type ZipLocation = {
  city: string;
  country: string;
  countryCode: string;
  state: string;
  stateCode: string;
};

export class Geocoding {
  private log: Logger;
  private client: Client;
  private googleMapsApiKey: string;

  constructor(log: Logger, config: ConfigType) {
    this.log = log;
    this.client = Container.get(Client);
    this.googleMapsApiKey = config.subscriptions.googleMapsApiKey;
  }

  async getLocationFromZip(zip: string, country: string = 'US') {
    const countryName =
      country.length === 2 ? countries.getName(country, 'en') : country;

    try {
      const {
        data: { results, status, error_message: errorMessage },
      } = await this.client.geocode({
        params: {
          address: `${zip},${countryName}`,
          key: this.googleMapsApiKey,
        },
      });

      if (status !== Status.OK)
        throw new Error(
          `${
            errorMessage ? `${status} - ${errorMessage}` : `${status}`
          } for ${zip}, ${country}`
        );

      const { address_components } = results[0];

      if (address_components) {
        const state = address_components.find((address) =>
          address.types.includes(PlaceType2.administrative_area_level_1)
        );
        const country = address_components.find((address) =>
          address.types.includes(PlaceType2.country)
        );
        const locality = address_components.find((address) =>
          address.types.includes(PlaceType2.locality)
        );
        const adminArea2 = address_components.find((address) =>
          address.types.includes(PlaceType2.administrative_area_level_2)
        );
        return {
          city: locality?.long_name || adminArea2?.long_name || '',
          country: country?.long_name || '',
          countryCode: country?.short_name || '',
          state: state?.long_name || '',
          stateCode: state?.short_name || '',
        };
      } else {
        throw new Error(`Address not found for ${zip}, ${country}`);
      }
    } catch (err) {
      this.log.error('geocoding.1', { err: err.message });
      return {};
    }
  }
}
