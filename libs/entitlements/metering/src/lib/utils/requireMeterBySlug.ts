/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  MeteringConfigurationManager,
  type StrapiMeter,
} from '@fxa/shared/cms';

import { MeterNotConfiguredError } from '../metering.error';

export async function requireMeterBySlug(
  meteringConfigurationManager: Pick<
    MeteringConfigurationManager,
    'getMeterBySlug'
  >,
  slug: string
): Promise<StrapiMeter> {
  const meter = await meteringConfigurationManager.getMeterBySlug(slug);
  if (!meter) {
    throw new MeterNotConfiguredError(slug);
  }
  return meter;
}
