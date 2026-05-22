/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { OpenMeter } from '@openmeter/sdk';
import { MeteringConfig } from './metering.config';

/**
 * Thin DI-friendly wrapper around the OpenMeter SDK so that consumers can
 * inject a single client instance and tests can replace it via Nest's standard
 * provider override. The SDK itself is stateless beyond the configured baseUrl
 * + apiKey, so we expose the underlying namespaces (events, meters, ...)
 * directly rather than re-implementing them here.
 */
@Injectable()
export class OpenMeterClient {
  public readonly sdk: OpenMeter;

  constructor(meteringConfig: MeteringConfig) {
    this.sdk = new OpenMeter({
      baseUrl: meteringConfig.openmeterBaseUrl,
      apiKey: meteringConfig.openmeterApiKey,
    });
  }

  get events(): OpenMeter['events'] {
    return this.sdk.events;
  }

  get meters(): OpenMeter['meters'] {
    return this.sdk.meters;
  }
}
