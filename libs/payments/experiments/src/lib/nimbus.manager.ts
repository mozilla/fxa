/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { generateNimbusId, NimbusClient } from '@fxa/shared/experiments';
import { NimbusManagerConfig } from './nimbus.manager.config';

@Injectable()
export class NimbusManager {
  constructor(
    private nimbusClient: NimbusClient,
    private nimbusManagerConfig: NimbusManagerConfig
  ) {}

  generateNimbusId(fxaUid?: string) {
    return generateNimbusId(this.nimbusManagerConfig.namespace, fxaUid);
  }

  async fetchExperiments(fxaUid?: string, language?: string, region?: string) {
    if (!this.nimbusManagerConfig.enabled) {
      return null;
    }

    try {
      const clientId = this.generateNimbusId(fxaUid);
      return await this.nimbusClient.fetchExperiments({
        clientId,
        context: { language: language || null, region: region || null },
      });
    } catch (error) {
      console.error('Failed to fetch Nimbus experiments:', error);
      return null;
    }
  }
}
