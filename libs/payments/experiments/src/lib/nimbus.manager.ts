/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable, Logger } from '@nestjs/common';
import { generateNimbusId, NimbusClient } from '@fxa/shared/experiments';
import { NimbusManagerConfig } from './nimbus.manager.config';
import { SubPlatNimbusResult } from './nimbus.types';

@Injectable()
export class NimbusManager {
  constructor(
    private log: Logger,
    private nimbusClient: NimbusClient,
    private nimbusManagerConfig: NimbusManagerConfig
  ) {}

  async fetchExperiments({
    nimbusUserId,
    language,
    region,
  }: {
    nimbusUserId: string;
    language?: string;
    region?: string;
  }) {
    if (!this.nimbusManagerConfig.enabled) {
      return null;
    }

    const results =
      await this.nimbusClient.fetchExperiments<SubPlatNimbusResult>({
        clientId: nimbusUserId,
        context: { language: language || null, region: region || null },
      });

    // Temporarily log results for debugging purposes
    this.log.log(JSON.stringify(results));

    return results;
  }

  generateNimbusId(fxaUid?: string, headerExperimentId?: string) {
    if (fxaUid) {
      return generateNimbusId(this.nimbusManagerConfig.namespace, fxaUid);
    } else if (headerExperimentId) {
      return headerExperimentId;
    } else {
      return generateNimbusId(this.nimbusManagerConfig.namespace);
    }
  }
}
