/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';
import { VError } from 'verror';

import { OpenMeterIngestError, OpenMeterQueryError } from './metering.error';
import { MeteringManager } from './metering.manager';
import { OpenMeterClient } from './openmeter.client';
import { METERING_EVENT_SOURCE } from './metering.constants';

async function rejectionOf(promise: Promise<unknown>): Promise<Error> {
  try {
    await promise;
  } catch (err) {
    if (err instanceof Error) {
      return err;
    }
    throw new Error(`expected an Error, got ${String(err)}`);
  }
  throw new Error('expected the promise to reject');
}

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
    it('forwards a single CloudEvent with the slug as type and amount in data', async () => {
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

    it('wraps SDK failures in OpenMeterIngestError and preserves the cause', async () => {
      const cause = new Error('boom');
      ingest.mockRejectedValue(cause);

      const error = await rejectionOf(
        meteringManager.ingest({
          id: 'evt-1',
          userIdentifier: 'user-1',
          slug: 'tokens_total',
          amount: 42,
        })
      );

      expect(error).toBeInstanceOf(OpenMeterIngestError);
      expect(VError.cause(error)).toBe(cause);
    });

    it('normalizes a non-Error rejection into the wrapped error cause', async () => {
      ingest.mockRejectedValue('string failure');

      const error = await rejectionOf(
        meteringManager.ingest({
          id: 'evt-1',
          userIdentifier: 'user-1',
          slug: 'tokens_total',
          amount: 42,
        })
      );

      expect(error).toBeInstanceOf(OpenMeterIngestError);
      expect(VError.cause(error)?.message).toBe('string failure');
    });
  });

  describe('ingestBatch', () => {
    it('forwards every event in one batched ingest call', async () => {
      await meteringManager.ingestBatch([
        { id: 'evt-1', userIdentifier: 'user-1', slug: 'tokens', amount: 1 },
        { id: 'evt-2', userIdentifier: 'user-2', slug: 'tokens', amount: 2 },
      ]);

      expect(ingest).toHaveBeenCalledTimes(1);
      const events = ingest.mock.calls[0][0];
      expect(events).toHaveLength(2);
      expect(events[0]).toEqual({
        id: 'evt-1',
        source: METERING_EVENT_SOURCE,
        type: 'tokens',
        subject: 'user-1',
        time: expect.any(Date),
        data: { amount: 1 },
      });
      expect(events[1]).toEqual({
        id: 'evt-2',
        source: METERING_EVENT_SOURCE,
        type: 'tokens',
        subject: 'user-2',
        time: expect.any(Date),
        data: { amount: 2 },
      });
    });

    it('is a no-op for an empty batch', async () => {
      await meteringManager.ingestBatch([]);
      expect(ingest).not.toHaveBeenCalled();
    });

    it('wraps SDK failures in OpenMeterIngestError and preserves the cause', async () => {
      const cause = new Error('boom');
      ingest.mockRejectedValue(cause);

      const error = await rejectionOf(
        meteringManager.ingestBatch([
          { id: 'evt-1', userIdentifier: 'user-1', slug: 'tokens', amount: 1 },
        ])
      );

      expect(error).toBeInstanceOf(OpenMeterIngestError);
      expect(VError.cause(error)).toBe(cause);
    });
  });

  describe('queryUsage', () => {
    const window = {
      from: new Date('2026-05-01T00:00:00.000Z'),
      to: new Date('2026-06-01T00:00:00.000Z'),
    };

    it('queries the meter by slug for the subject and sums all rows in the window', async () => {
      query.mockResolvedValue({
        data: [{ value: 10 }, { value: 5 }, { value: 0 }],
      });

      const result = await meteringManager.queryUsage({
        userIdentifier: 'user-1',
        slug: 'tokens_total',
        ...window,
      });

      expect(query).toHaveBeenCalledWith('tokens_total', {
        from: window.from,
        to: window.to,
        subject: ['user-1'],
      });
      expect(result).toEqual({ usage: 15, from: window.from, to: window.to });
    });

    it('returns zero usage when there are no rows', async () => {
      query.mockResolvedValue({ data: [] });

      const result = await meteringManager.queryUsage({
        userIdentifier: 'user-1',
        slug: 'tokens_total',
        ...window,
      });

      expect(result.usage).toBe(0);
    });

    it('wraps SDK failures in OpenMeterQueryError and preserves the cause', async () => {
      const cause = new Error('boom');
      query.mockRejectedValue(cause);

      const error = await rejectionOf(
        meteringManager.queryUsage({
          userIdentifier: 'user-1',
          slug: 'tokens_total',
          ...window,
        })
      );

      expect(error).toBeInstanceOf(OpenMeterQueryError);
      expect(VError.cause(error)).toBe(cause);
    });
  });
});
