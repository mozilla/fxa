/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getOperationName } from '@apollo/client/utilities';
import { Inject, Injectable } from '@nestjs/common';
import { StatsD } from 'hot-shots';

import { StatsDService } from '@fxa/shared/metrics/statsd';
import { relyingPartyQuery } from '@fxa/shared/cms';
import { StrapiClient, StrapiClientEventResponse } from './strapi.client';

@Injectable()
export class RelyingPartyConfigurationManager {
  constructor(
    private strapiClient: StrapiClient,
    @Inject(StatsDService)
    private statsd: StatsD
  ) {
    this.strapiClient.on('response', this.onStrapiClientResponse.bind(this));
  }

  onStrapiClientResponse(response: StrapiClientEventResponse) {
    const defaultTags = {
      method: response.method,
      error: response.error ? 'true' : 'false',
      cache: `${response.cache}`,
      cacheType: `${response.cacheType}`,
    };
    const operationName = response.query && getOperationName(response.query);
    const tags = operationName
      ? { ...defaultTags, operationName }
      : defaultTags;
    this.statsd.timing(
      'cms_accounts_request',
      response.elapsed,
      undefined,
      tags
    );
  }

  async fetchCMSData(clientId: string, entrypoint: string) {
    return await this.strapiClient.query(relyingPartyQuery, {
      clientId,
      entrypoint,
    });
  }
  async invalidateCache(clientId: string, entrypoint: string) {
    return await this.strapiClient.invalidateQueryCache(relyingPartyQuery, {
      clientId,
      entrypoint,
    });
  }
}
