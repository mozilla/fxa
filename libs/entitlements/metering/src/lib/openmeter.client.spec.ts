/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';
import { OpenMeter } from '@openmeter/sdk';

import { MeteringConfig, MockMeteringConfig } from './metering.config';
import { OpenMeterClient } from './openmeter.client';

async function buildClient(meteringConfig: MeteringConfig): Promise<OpenMeterClient> {
  const moduleRef = await Test.createTestingModule({
    providers: [
      OpenMeterClient,
      { provide: MeteringConfig, useValue: meteringConfig },
    ],
  }).compile();
  return moduleRef.get(OpenMeterClient);
}

describe('OpenMeterClient', () => {
  it('constructs the underlying OpenMeter SDK with the configured base URL and API key', async () => {
    const openMeterClient = await buildClient(MockMeteringConfig);
    expect(openMeterClient.sdk).toBeInstanceOf(OpenMeter);
    expect(openMeterClient.sdk.config.baseUrl).toBe(MockMeteringConfig.openmeterBaseUrl);
    expect(openMeterClient.sdk.config.apiKey).toBe(MockMeteringConfig.openmeterApiKey);
  });

  it('works without an apiKey for self-hosted local dev', async () => {
    const openMeterClient = await buildClient({
      ...MockMeteringConfig,
      openmeterApiKey: undefined,
    });
    expect(openMeterClient.sdk).toBeInstanceOf(OpenMeter);
    expect(openMeterClient.sdk.config.apiKey).toBeUndefined();
  });
});
