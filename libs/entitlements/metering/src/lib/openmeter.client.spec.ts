/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';

import { MeteringConfig, MockMeteringConfig } from './metering.config';
import { OpenMeterClient } from './openmeter.client';
import type { MeteringCloudEvent } from './utils/toMeteringCloudEvent';

const sdkCtor = jest.fn();
const sdkIngest = jest.fn().mockResolvedValue(undefined);
const sdkQuery = jest.fn();

const clientCtor = jest.fn();
const clientIngest = jest.fn().mockResolvedValue(undefined);
const clientList = jest.fn();
const clientQuery = jest.fn();

jest.mock('@openmeter/sdk', () => ({
  OpenMeter: function (options: unknown) {
    sdkCtor(options);
    return { events: { ingest: sdkIngest }, meters: { query: sdkQuery } };
  },
}));

jest.mock('@openmeter/client', () => ({
  OpenMeter: function (options: unknown) {
    clientCtor(options);
    return {
      events: { ingest: clientIngest },
      meters: { list: clientList, query: clientQuery },
    };
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

const EVENT: MeteringCloudEvent = {
  id: 'evt-1',
  source: 'test-source',
  type: 'tokens_total',
  subject: 'user-1',
  time: new Date('2026-05-07T12:00:00.000Z'),
  data: { amount: 42 },
};

const WINDOW = {
  from: new Date('2026-05-01T00:00:00.000Z'),
  to: new Date('2026-06-01T00:00:00.000Z'),
};

describe('OpenMeterClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('v1 backend (@openmeter/sdk)', () => {
    const v1Config: MeteringConfig = {
      ...MockMeteringConfig,
      openmeterApiVersion: 'v1',
    };

    it('constructs the SDK with the configured base URL and API key', async () => {
      await buildClient(v1Config);
      expect(sdkCtor).toHaveBeenCalledWith({
        baseUrl: v1Config.openmeterBaseUrl,
        apiKey: v1Config.openmeterApiKey,
      });
      expect(clientCtor).not.toHaveBeenCalled();
    });

    it('is the default backend when no api version is configured', async () => {
      await buildClient({
        ...MockMeteringConfig,
        openmeterApiVersion: undefined,
      });
      expect(sdkCtor).toHaveBeenCalledTimes(1);
      expect(clientCtor).not.toHaveBeenCalled();
    });

    it('ingests events with a Date timestamp', async () => {
      const client = await buildClient(v1Config);
      await client.ingest([EVENT]);
      expect(sdkIngest).toHaveBeenCalledWith([
        {
          id: 'evt-1',
          source: 'test-source',
          type: 'tokens_total',
          subject: 'user-1',
          time: EVENT.time,
          data: { amount: 42 },
        },
      ]);
    });

    it('queries by slug and sums the numeric row values', async () => {
      sdkQuery.mockResolvedValue({ data: [{ value: 10 }, { value: 5 }] });
      const client = await buildClient(v1Config);

      const usage = await client.queryUsage({
        slug: 'tokens_total',
        subject: ['user-1'],
        ...WINDOW,
      });

      expect(sdkQuery).toHaveBeenCalledWith('tokens_total', {
        from: WINDOW.from,
        to: WINDOW.to,
        subject: ['user-1'],
      });
      expect(usage).toBe(15);
    });
  });

  describe('v3 backend (@openmeter/client)', () => {
    const v3Config: MeteringConfig = {
      ...MockMeteringConfig,
      openmeterApiVersion: 'v3',
    };

    it('constructs the client with the configured base URL and API key', async () => {
      await buildClient(v3Config);
      expect(clientCtor).toHaveBeenCalledWith({
        baseUrl: v3Config.openmeterBaseUrl,
        apiKey: v3Config.openmeterApiKey,
      });
      expect(sdkCtor).not.toHaveBeenCalled();
    });

    it('ingests events with an ISO string timestamp', async () => {
      const client = await buildClient(v3Config);
      await client.ingest([EVENT]);
      expect(clientIngest).toHaveBeenCalledWith([
        {
          id: 'evt-1',
          source: 'test-source',
          type: 'tokens_total',
          subject: 'user-1',
          time: '2026-05-07T12:00:00.000Z',
          data: { amount: 42 },
        },
      ]);
    });

    it('resolves the meter id from the slug, then queries by id and sums the string row values', async () => {
      clientList.mockResolvedValue({
        data: [{ id: 'meter-id-1', key: 'tokens_total' }],
      });
      clientQuery.mockResolvedValue({
        data: [{ value: '10' }, { value: '5' }],
      });
      const client = await buildClient(v3Config);

      const usage = await client.queryUsage({
        slug: 'tokens_total',
        subject: ['user-1'],
        ...WINDOW,
      });

      expect(clientList).toHaveBeenCalledWith({
        filter: { key: 'tokens_total' },
      });
      expect(clientQuery).toHaveBeenCalledWith({
        meterId: 'meter-id-1',
        body: {
          from: WINDOW.from.toISOString(),
          to: WINDOW.to.toISOString(),
          filters: { dimensions: { subject: { in: ['user-1'] } } },
        },
      });
      expect(usage).toBe(15);
    });

    it('caches the slug to id mapping and does not look it up again', async () => {
      clientList.mockResolvedValue({
        data: [{ id: 'meter-id-1', key: 'tokens_total' }],
      });
      clientQuery.mockResolvedValue({ data: [{ value: '3' }] });
      const client = await buildClient(v3Config);

      await client.queryUsage({
        slug: 'tokens_total',
        subject: ['user-1'],
        ...WINDOW,
      });
      await client.queryUsage({
        slug: 'tokens_total',
        subject: ['user-1'],
        ...WINDOW,
      });

      expect(clientList).toHaveBeenCalledTimes(1);
      expect(clientQuery).toHaveBeenCalledTimes(2);
    });

    it('collapses concurrent lookups for the same slug into one request', async () => {
      clientList.mockResolvedValue({
        data: [{ id: 'meter-id-1', key: 'tokens_total' }],
      });
      clientQuery.mockResolvedValue({ data: [{ value: '1' }] });
      const client = await buildClient(v3Config);

      await Promise.all([
        client.queryUsage({ slug: 'tokens_total', subject: ['a'], ...WINDOW }),
        client.queryUsage({ slug: 'tokens_total', subject: ['b'], ...WINDOW }),
      ]);

      expect(clientList).toHaveBeenCalledTimes(1);
    });

    it('rejects when no meter matches the slug', async () => {
      clientList.mockResolvedValue({ data: [] });
      const client = await buildClient(v3Config);

      await expect(
        client.queryUsage({ slug: 'missing', subject: ['user-1'], ...WINDOW })
      ).rejects.toThrow();
      expect(clientQuery).not.toHaveBeenCalled();
    });

    it('does not cache a failed lookup and retries on the next query', async () => {
      clientList
        .mockRejectedValueOnce(new Error('lookup boom'))
        .mockResolvedValue({
          data: [{ id: 'meter-id-1', key: 'tokens_total' }],
        });
      clientQuery.mockResolvedValue({ data: [{ value: '9' }] });
      const client = await buildClient(v3Config);

      await expect(
        client.queryUsage({
          slug: 'tokens_total',
          subject: ['user-1'],
          ...WINDOW,
        })
      ).rejects.toThrow('lookup boom');

      const usage = await client.queryUsage({
        slug: 'tokens_total',
        subject: ['user-1'],
        ...WINDOW,
      });

      expect(usage).toBe(9);
      expect(clientList).toHaveBeenCalledTimes(2);
    });
  });
});
