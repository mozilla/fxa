/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';
import { VError } from 'verror';

import { OpenMeterQueryError } from './metering.error';
import { MeteringQueryManager } from './metering-query.manager';
import { OpenMeterClient } from './openmeter.client';

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

describe('MeteringQueryManager', () => {
  let meteringQueryManager: MeteringQueryManager;
  let queryUsage: jest.Mock;

  beforeEach(async () => {
    queryUsage = jest.fn();

    const moduleRef = await Test.createTestingModule({
      providers: [
        MeteringQueryManager,
        {
          provide: OpenMeterClient,
          useValue: { queryUsage },
        },
      ],
    }).compile();

    meteringQueryManager = moduleRef.get(MeteringQueryManager);
  });

  describe('queryUsage', () => {
    const window = {
      from: new Date('2026-05-01T00:00:00.000Z'),
      to: new Date('2026-06-01T00:00:00.000Z'),
    };

    it('queries usage for the subject in the window and returns it', async () => {
      queryUsage.mockResolvedValue(15);

      const result = await meteringQueryManager.queryUsage({
        userIdentifier: 'user-1',
        slug: 'tokens_total',
        ...window,
      });

      expect(queryUsage).toHaveBeenCalledWith({
        slug: 'tokens_total',
        subject: ['user-1'],
        from: window.from,
        to: window.to,
      });
      expect(result).toEqual({ usage: 15, from: window.from, to: window.to });
    });

    it('returns zero usage when the client reports none', async () => {
      queryUsage.mockResolvedValue(0);

      const result = await meteringQueryManager.queryUsage({
        userIdentifier: 'user-1',
        slug: 'tokens_total',
        ...window,
      });

      expect(result.usage).toBe(0);
    });

    it('wraps client failures in OpenMeterQueryError and preserves the cause', async () => {
      const cause = new Error('boom');
      queryUsage.mockRejectedValue(cause);

      const error = await rejectionOf(
        meteringQueryManager.queryUsage({
          userIdentifier: 'user-1',
          slug: 'tokens_total',
          ...window,
        })
      );

      expect(error).toBeInstanceOf(OpenMeterQueryError);
      expect(VError.cause(error)).toBe(cause);
    });

    it('normalizes a non-Error rejection into the wrapped error cause', async () => {
      queryUsage.mockRejectedValue('query failure');

      const error = await rejectionOf(
        meteringQueryManager.queryUsage({
          userIdentifier: 'user-1',
          slug: 'tokens_total',
          ...window,
        })
      );

      expect(error).toBeInstanceOf(OpenMeterQueryError);
      expect(VError.cause(error)?.message).toBe('query failure');
    });
  });
});
