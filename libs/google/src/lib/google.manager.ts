/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { AddressType } from '@googlemaps/google-maps-services-js';
import { GoogleClient } from './google.client';

@Injectable()
export class GoogleManager {
  constructor(private googleClient: GoogleClient) {}

  async isValidPostalCode(postalCode: string, countryCode: string) {
    const response = await this.googleClient.geocode(postalCode, countryCode);
    const { results } = response;
    const isValid =
      results.length > 0 &&
      results.some((result) =>
        result.address_components.some((component) =>
          component.types.includes('postal_code' as AddressType)
        )
      );
    return isValid ? true : false;
  }
}
