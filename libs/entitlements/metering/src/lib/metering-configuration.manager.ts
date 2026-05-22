/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import {
  meterBySlugQuery,
  StrapiClient,
  type StrapiMeter,
} from '@fxa/shared/cms';

@Injectable()
export class MeteringConfigurationManager {
  constructor(private readonly strapiClient: StrapiClient) {}

  async getMeterBySlug(slug: string): Promise<StrapiMeter | null> {
    const result = await this.strapiClient.query(meterBySlugQuery, { slug });
    return result.meters[0] ?? null;
  }
}
