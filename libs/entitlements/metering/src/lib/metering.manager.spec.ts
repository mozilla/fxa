/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';

import {
  OpenMeterIngestError,
  OpenMeterQueryError,
} from './metering.error';
import { MeteringManager } from './metering.manager';
import { OpenMeterClient } from './openmeter.client';
import { METERING_EVENT_SOURCE } from './metering.types';

describe('MeteringManager', () => {
  let meteringManager: MeteringManager;
  let ingest: jest.Mock;
  let query: jest.Mock;

  beforeEach(async () => {
    ingest = jest.fn();
    query = jest.fn();

    const moduleRef = await Test.createTestingModule({
      providers: [
        MeteringManager,
        {
          provide: OpenMeterClient,
          useValue: {
            events: { ingest },
            meters: { query },
          },
        },
      ],
    }).compile();

    meteringManager = moduleRef.get(MeteringManager);
  });

  describe('ingest', () => {
    it('builds a CloudEvent with the slug as type and amount in data', async () => {
      const timestamp = new Date('2026-05-07T12:00:00.000Z');
      await meteringManager.ingest({
        id: 'evt-1',
        userIdentifier: 'user-1',
        slug: 'tokens_total',
        amount: 42,
        timestamp,
      });

      expect(ingest).toHaveBeenCalledWith({
        id: 'evt-1',
        source: METERING_EVENT_SOURCE,
        type: 'tokens_total',
        subject: 'user-1',
        time: timestamp,
        data: { amount: 42 },
      });
    });

    it('defaults timestamp to now when not provided', async () => {
      await meteringManager.ingest({
        id: 'evt-1',
        userIdentifier: 'user-1',
        slug: 'tokens_total',
        amount: 42,
      });

      const passedEvent = ingest.mock.calls[0][0];
      expect(passedEvent.time).toBeInstanceOf(Date);
    });

    it('wraps SDK failures in OpenMeterIngestError', async () => {
      ingest.mockRejectedValue(new Error('boom'));

      await expect(
        meteringManager.ingest({
          id: 'evt-1',
          userIdentifier: 'user-1',
          slug: 'tokens_total',
          amount: 42,
        })
      ).rejects.toThrow(OpenMeterIngestError);
    });
  });

  describe('queryUsage', () => {
    it('sums all rows returned in the query window', async () => {
      query.mockResolvedValue({
        data: [{ value: 10 }, { value: 5 }, { value: 0 }],
      });

      const result = await meteringManager.queryUsage({
        userIdentifier: 'user-1',
        slug: 'tokens_total',
        from: new Date('2026-05-01T00:00:00.000Z'),
        to: new Date('2026-06-01T00:00:00.000Z'),
      });

      expect(query).toHaveBeenCalledWith('tokens_total', {
        from: new Date('2026-05-01T00:00:00.000Z'),
        to: new Date('2026-06-01T00:00:00.000Z'),
        subject: ['user-1'],
      });
      expect(result.usage).toBe(15);
    });

    it('returns zero usage when there are no rows', async () => {
      query.mockResolvedValue({ data: [] });

      const result = await meteringManager.queryUsage({
        userIdentifier: 'user-1',
        slug: 'tokens_total',
        from: new Date('2026-05-01T00:00:00.000Z'),
        to: new Date('2026-06-01T00:00:00.000Z'),
      });

      expect(result.usage).toBe(0);
    });

    it('wraps SDK failures in OpenMeterQueryError', async () => {
      query.mockRejectedValue(new Error('boom'));

      await expect(
        meteringManager.queryUsage({
          userIdentifier: 'user-1',
          slug: 'tokens_total',
          from: new Date('2026-05-01T00:00:00.000Z'),
          to: new Date('2026-06-01T00:00:00.000Z'),
        })
      ).rejects.toThrow(OpenMeterQueryError);
    });
  });
});
