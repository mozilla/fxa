/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { generateNimbusId, NimbusClient } from '@fxa/shared/experiments';
import type { NimbusManagerConfig } from './nimbus.manager.config';

@Injectable()
export class NimbusManager {
  constructor(
    private nimbusClient: NimbusClient,
    private nimbusManagerConfig: NimbusManagerConfig
  ) {}

  async fetchExperiments(fxaUid?: string, language?: string, region?: string) {
    if (!this.nimbusManagerConfig.enabled) {
      return null;
    }

    try {
      return await this.nimbusClient.fetchExperiments({
        clientId: generateNimbusId(this.nimbusManagerConfig.namespace, fxaUid),
        context: { language: language || null, region: region || null },
      });
    } catch (error) {
      return null;
    }
  }
}
