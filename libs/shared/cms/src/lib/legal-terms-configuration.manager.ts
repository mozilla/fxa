/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable } from '@nestjs/common';
import { StatsD } from 'hot-shots';
import { getOperationName } from '@apollo/client/utilities';

import { StatsDService } from '@fxa/shared/metrics/statsd';
import { StrapiClient, StrapiClientEventResponse } from './strapi.client';
import { legalTermsQuery, LegalTermsResultUtil } from './queries/legal-terms';

@Injectable()
export class LegalTermsConfigurationManager {
  constructor(
    private strapiClient: StrapiClient,
    @Inject(StatsDService)
    private statsd: StatsD
  ) {
    if (this.strapiClient.on) {
      this.strapiClient.on('response', this.onStrapiClientResponse.bind(this));
    }
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
      'cms_legal_terms_request',
      response.elapsed,
      undefined,
      tags
    );
  }

  /**
   * Get legal terms (ToS/PP) customization by OAuth client ID
   * Used for OAuth RP redirect flows
   */
  async getLegalTermsByClientId(
    clientId: string
  ): Promise<LegalTermsResultUtil> {
    const queryResult = await this.strapiClient.query(legalTermsQuery, {
      identifier: clientId,
    });

    return new LegalTermsResultUtil(queryResult);
  }

  /**
   * Get legal terms (ToS/PP) customization by service parameter
   * Used for OAuth Native flows (e.g., service=relay, service=sync)
   */
  async getLegalTermsByService(service: string): Promise<LegalTermsResultUtil> {
    const queryResult = await this.strapiClient.query(legalTermsQuery, {
      identifier: service,
    });

    return new LegalTermsResultUtil(queryResult);
  }
}
