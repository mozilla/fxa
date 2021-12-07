import {
  AddressComponent,
  AddressType,
  Client,
  PlaceType2,
  Status,
} from '@googlemaps/google-maps-services-js';
import countries from 'i18n-iso-countries';
import { Logger } from 'mozlog';
import { Container } from 'typedi';

import { ConfigType } from '../config';

export type ZipLocation = {
  city: string;
  country: string;
  countryCode: string;
  state: string;
  stateCode: string;
};

export class GoogleMapsService {
  private log: Logger;
  private client: Client;
  private googleMapsApiKey: string;

  constructor(log: Logger, config: ConfigType) {
    this.log = log;
    this.client = Container.get(Client);
    this.googleMapsApiKey = config.googleMapsApiKey;
  }

  findAddressComponentByType(
    addressComponents: AddressComponent[],
    type: AddressType
  ) {
    return addressComponents.find((address) => address.types.includes(type));
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
          } for ${zip}, ${countryName}`
        );

      const { address_components: addressComponents } = results[0];

      if (addressComponents) {
        const state = this.findAddressComponentByType(
          addressComponents,
          PlaceType2.administrative_area_level_1
        );
        const country = this.findAddressComponentByType(
          addressComponents,
          PlaceType2.country
        );
        const locality = this.findAddressComponentByType(
          addressComponents,
          PlaceType2.locality
        );
        const adminArea2 = this.findAddressComponentByType(
          addressComponents,
          PlaceType2.administrative_area_level_2
        );

        return {
          city: locality?.long_name || adminArea2?.long_name || '',
          country: country?.long_name || '',
          countryCode: country?.short_name || '',
          state: state?.long_name || '',
          stateCode: state?.short_name || '',
        };
      } else {
        throw new Error(`Address not found for ${zip}, ${countryName}`);
      }
    } catch (error) {
      this.log.error('GoogleMapsServices.getLocationFromZip.failed', { error });
      return {};
    }
  }
}
