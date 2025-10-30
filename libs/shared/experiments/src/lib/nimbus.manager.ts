/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import type { NimbusContext } from './nimbus.types';
import { NimbusClient } from './nimbus.client';

@Injectable()
export class NimbusManager {
  constructor(private nimbusClient: NimbusClient) {}

  async fetchExperiments(params: { clientId: string; context: NimbusContext }) {
    return this.nimbusClient.fetchExperiments(params);
  }
}
