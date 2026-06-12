/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getOperationName } from '@apollo/client/utilities';
import { Inject, Injectable } from '@nestjs/common';
import { StatsD } from 'hot-shots';

import { StatsDService } from '@fxa/shared/metrics/statsd';
import { meterBySlugQuery } from './queries/meter';
import type { StrapiMeter } from './queries/meter';
import { StrapiClient, StrapiClientEventResponse } from './strapi.client';
import type { DeepNonNullable } from './types';
import type { MeterBySlugQuery } from '../__generated__/graphql';

@Injectable()
export class MeteringConfigurationManager {
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
      'cms_metering_request',
      response.elapsed,
      undefined,
      tags
    );
  }

  async getMeterBySlug(slug: string): Promise<StrapiMeter | null> {
    const queryResult = (await this.strapiClient.query(meterBySlugQuery, {
      slug,
    })) as DeepNonNullable<MeterBySlugQuery>;

    return queryResult.meters.at(0) ?? null;
  }
}
