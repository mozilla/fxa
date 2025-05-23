/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Client } from '@googlemaps/google-maps-services-js';
import { Inject, Injectable } from '@nestjs/common';
import { GoogleClientConfig } from './google.client.config';
import {
  CaptureTimingWithStatsD,
  StatsDService,
  type StatsD,
} from '@fxa/shared/metrics/statsd';
import type { GeocodeRequestParamsOnly } from './types';

@Injectable()
export class GoogleClient {
  private readonly google: Client;
  constructor(
    private googleClientConfig: GoogleClientConfig,
    @Inject(StatsDService) public statsd: StatsD
  ) {
    this.google = new Client();
  }

  /**
   * Retrieve Geocode Data for the specified address. For more information review
   * https://developers.google.com/maps/documentation/geocoding/overview
   */
  @CaptureTimingWithStatsD()
  async geocode(params: GeocodeRequestParamsOnly) {
    const response = await this.google.geocode({
      params: {
        ...params,
        key: this.googleClientConfig.googleMapsApiKey,
      },
    });

    return response.data;
  }
}
