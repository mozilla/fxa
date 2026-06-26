/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';

import { MeteringConfig, MockMeteringConfig } from './metering.config';
import { OpenMeterClient } from './openmeter.client';

const mockEvents = { namespace: 'events' };
const mockMeters = { namespace: 'meters' };
const mockOpenMeterConstructor = jest.fn();

jest.mock('@openmeter/sdk', () => ({
  OpenMeter: function (config: unknown) {
    mockOpenMeterConstructor(config);
    return { config, events: mockEvents, meters: mockMeters };
  },
}));

async function buildClient(
  meteringConfig: MeteringConfig
): Promise<OpenMeterClient> {
  const moduleRef = await Test.createTestingModule({
    providers: [
      OpenMeterClient,
      { provide: MeteringConfig, useValue: meteringConfig },
    ],
  }).compile();
  return moduleRef.get(OpenMeterClient);
}

describe('OpenMeterClient', () => {
  beforeEach(() => {
    mockOpenMeterConstructor.mockClear();
  });

  it('constructs the OpenMeter SDK with the configured base URL and API key', async () => {
    await buildClient(MockMeteringConfig);
    expect(mockOpenMeterConstructor).toHaveBeenCalledWith({
      baseUrl: MockMeteringConfig.openmeterBaseUrl,
      apiKey: MockMeteringConfig.openmeterApiKey,
    });
  });

  it('constructs without an apiKey for self-hosted local dev', async () => {
    await buildClient({ ...MockMeteringConfig, openmeterApiKey: undefined });
    expect(mockOpenMeterConstructor).toHaveBeenCalledWith({
      baseUrl: MockMeteringConfig.openmeterBaseUrl,
      apiKey: undefined,
    });
  });

  it('exposes the SDK events and meters namespaces', async () => {
    const openMeterClient = await buildClient(MockMeteringConfig);
    expect(openMeterClient.events).toBe(mockEvents);
    expect(openMeterClient.meters).toBe(mockMeters);
  });
});
