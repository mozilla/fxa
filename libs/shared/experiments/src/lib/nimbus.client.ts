/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable } from '@nestjs/common';
import { NimbusClientConfig } from './nimbus.config';
import type { NimbusContext } from './nimbus.types';
import {
  NimbusClientFetchExperimentsUnexpectedError,
  NimbusClientFetchExperimentsHandledError,
} from './nimbus.errors';
import {
  CaptureTimingWithStatsD,
  StatsD,
  StatsDService,
} from '@fxa/shared/metrics/statsd';

@Injectable()
export class NimbusClient {
  constructor(
    private config: NimbusClientConfig,
    @Inject(StatsDService) public statsd: StatsD
  ) {}

  @CaptureTimingWithStatsD()
  async fetchExperiments<ResultT>(params: {
    clientId: string;
    preview: boolean;
    context: NimbusContext;
  }) {
    const { clientId, context } = params;

    const body = JSON.stringify({
      client_id: clientId,
      context,
    });

    const queryParams = new URLSearchParams({
      nimbus_preview: params.preview ? 'true' : 'false',
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, this.config.timeoutMs);

    try {
      const resp = await fetch(
        `${this.config.apiUrl}?${queryParams.toString()}`,
        {
          method: 'POST',
          body,
          // A request to cirrus should not be more than 50ms,
          // but we give it a large enough padding.
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!resp.ok) {
        const errorResponse = await resp.json();
        throw new NimbusClientFetchExperimentsHandledError(
          errorResponse,
          params
        );
      }

      return (await resp.json()) as ResultT;
    } catch (err) {
      if (err instanceof NimbusClientFetchExperimentsHandledError) {
        throw err;
      } else {
        throw new NimbusClientFetchExperimentsUnexpectedError(err, params);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
