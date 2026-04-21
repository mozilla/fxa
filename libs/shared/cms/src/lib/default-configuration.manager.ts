/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getOperationName } from '@apollo/client/utilities';
import { Inject, Injectable } from '@nestjs/common';
import { StatsD } from 'hot-shots';

import { StatsDService } from '@fxa/shared/metrics/statsd';
import { defaultCmsQuery } from '@fxa/shared/cms';
import { StrapiClient, StrapiClientEventResponse } from './strapi.client';
import { LOGGER_PROVIDER } from '@fxa/shared/log';
import type { Logger } from '@fxa/shared/log';

@Injectable()
export class DefaultCmsConfigurationManager {
  constructor(
    private strapiClient: StrapiClient,
    @Inject(StatsDService)
    private statsd: StatsD,
    @Inject(LOGGER_PROVIDER) private readonly log: Logger
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
    if (response.error) {
      this.log.error('cms.default.requestFailed', {
        operationName,
        error: response.error,
      });
    }
    this.statsd.timing(
      'cms_default_request',
      response.elapsed,
      undefined,
      tags
    );
  }

  async fetchDefault() {
    return await this.strapiClient.query(defaultCmsQuery, {});
  }

  async invalidateCache() {
    return await this.strapiClient.invalidateQueryCache(defaultCmsQuery, {});
  }
}
