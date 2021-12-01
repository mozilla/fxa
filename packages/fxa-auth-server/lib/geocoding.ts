import {
  Client,
  PlaceType2,
  Status,
} from '@googlemaps/google-maps-services-js';
import countries from 'i18n-iso-countries';
import { ConfigType } from '../config';
import { Logger } from 'mozlog';
const config: ConfigType = require('../config').getProperties();

export type ZipLocation = {
  city: string;
  country: string;
  countryCode: string;
  state: string;
  stateCode: string;
};

/**
 *
 * @param zip
 * @param country - Two-letter country code ([ISO 3166-1 alpha-2] or corresponding Country name
 * @returns
 */
export async function getLocationFromZip(
  log: Logger,
  zip: string,
  country: string = 'US'
): Promise<ZipLocation | {}> {
  const client = new Client();
  const countryName =
    country.length === 2 ? countries.getName(country, 'en') : country;

  try {
    const {
      data: { results, status },
    } = await client.geocode({
      params: {
        address: `${zip},${countryName}`,
        key: config.subscriptions.googleMapsApiKey,
      },
    });

    if (status !== Status.OK) throw new Error(status);

    const { address_components } = results[0];

    if (address_components) {
      const state = address_components.find((add) =>
        add.types.includes(PlaceType2.administrative_area_level_1)
      );
      const country = address_components.find((add) =>
        add.types.includes(PlaceType2.country)
      );
      const locality = address_components.find((add) =>
        add.types.includes(PlaceType2.locality)
      );
      const adminArea2 = address_components.find((add) =>
        add.types.includes(PlaceType2.administrative_area_level_2)
      );
      return {
        city: locality?.long_name || adminArea2?.long_name || '',
        country: country?.long_name || '',
        countryCode: country?.short_name || '',
        state: state?.long_name || '',
        stateCode: state?.short_name || '',
      };
    } else {
      throw new Error(status);
    }
  } catch (err) {
    log.error('geocoding.1', { err: err.message });
    return {};
  }
}
