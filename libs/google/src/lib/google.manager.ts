/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { AddressType } from '@googlemaps/google-maps-services-js';
import { GoogleClient } from './google.client';
import { ROMANIAN_POSTAL_CODES } from './google.constants';

@Injectable()
export class GoogleManager {
  constructor(private googleClient: GoogleClient) {}

  async validateAndFormatPostalCode(postalCode: string, countryCode: string) {
    // Google maps does not geocode Romanian postal codes correctly.
    if (countryCode === 'RO' || countryCode === 'ROU') {
      const isRomanianPostalCode = ROMANIAN_POSTAL_CODES.some((regex) =>
        regex.test(postalCode)
      );

      if (isRomanianPostalCode) {
        return {
          isValid: true,
          formattedPostalCode: postalCode,
        };
      }
    }

    const { results } = await this.googleClient.geocode({
      address: postalCode,
      components: `country:${countryCode}|postal_code:${postalCode}`,
    });

    const postalCodeAddressComponent = results
      .find((result) =>
        result.address_components.find((component) =>
          component.types.includes('postal_code' as AddressType)
        )
      )
      ?.address_components.find((component) =>
        component.types.includes('postal_code' as AddressType)
      );

    if (postalCodeAddressComponent?.short_name) {
      return {
        isValid: true,
        formattedPostalCode: postalCodeAddressComponent.short_name,
      };
    } else {
      return {
        isValid: false,
      };
    }
  }
}
