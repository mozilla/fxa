/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  MeteringConfigurationManager,
  StrapiMeterFactory,
} from '@fxa/shared/cms';

import { MeterNotConfiguredError } from '../metering.error';
import { requireMeterBySlug } from './requireMeterBySlug';

describe('requireMeterBySlug', () => {
  let meteringConfigurationManager: jest.Mocked<
    Pick<MeteringConfigurationManager, 'getMeterBySlug'>
  >;

  beforeEach(() => {
    meteringConfigurationManager = { getMeterBySlug: jest.fn() };
  });

  it('returns the meter when the slug is configured', async () => {
    const meter = StrapiMeterFactory({ slug: 'tokens' });
    meteringConfigurationManager.getMeterBySlug.mockResolvedValue(meter);

    const result = await requireMeterBySlug(
      meteringConfigurationManager,
      'tokens'
    );

    expect(meteringConfigurationManager.getMeterBySlug).toHaveBeenCalledWith(
      'tokens'
    );
    expect(result).toBe(meter);
  });

  it('throws MeterNotConfiguredError when the slug is not configured', async () => {
    meteringConfigurationManager.getMeterBySlug.mockResolvedValue(null);

    await expect(
      requireMeterBySlug(meteringConfigurationManager, 'tokens')
    ).rejects.toThrow(MeterNotConfiguredError);
  });
});
