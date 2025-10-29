/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import type { NimbusClientConfig } from './nimbus.config';
import type { NimbusContext, NimbusResult } from './nimbus.types';
import {
  NimbusClientFetchExperimentsError,
  NimbusClientFetchExperimentsHandledError,
} from './nimbus.errors';

@Injectable()
export class NimbusClient {
  constructor(private config: NimbusClientConfig) {}

  // TODO -- Add caching
  async fetchExperiments(params: { clientId: string; context: NimbusContext }) {
    const { clientId, context } = params;

    const body = JSON.stringify({
      client_id: clientId,
      context,
    });

    try {
      const query =
        this.config.previewEnabled === true
          ? `?nimbusPreview=${this.config.previewEnabled}`
          : '';
      const resp = await fetch(
        `${this.config.apiUrl}/nimbus-experiments${query}`,
        {
          method: 'POST',
          body,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!resp.ok) {
        const errorResponse = await resp.json();
        throw new NimbusClientFetchExperimentsHandledError(errorResponse);
      }

      return (await resp.json()) as NimbusResult;
    } catch (err) {
      throw new NimbusClientFetchExperimentsError(err, params);
    }
  }
}
