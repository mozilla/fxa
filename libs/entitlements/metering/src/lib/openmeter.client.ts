/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { OpenMeter } from '@openmeter/sdk';

import { MeteringConfig } from './metering.config';

/**
 * DI wrapper around the OpenMeter SDK so consumers inject one client and tests
 * can override it.
 */
@Injectable()
export class OpenMeterClient {
  private readonly sdk: OpenMeter;

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
