/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';

import { MeteringDedupeManager } from './metering-dedupe.manager';
import type { DedupePipeline, DedupeRedis } from './metering.types';
import { MeteringDedupeRedisClient } from './metering-dedupe.provider';
import { DedupeError } from './metering.error';
import {
  MockMeteringRedisConfig,
  MeteringRedisConfig,
} from './metering-redis.config';

interface RecordedCommand {
  command: 'set' | 'get';
  args: unknown[];
}

function pipelineReturning(
  replies: Array<[Error | null, unknown]>,
  commands: RecordedCommand[]
): DedupePipeline {
  return {
    set(...args: unknown[]) {
      commands.push({ command: 'set', args });
      return this;
    },
    get(key: string) {
      commands.push({ command: 'get', args: [key] });
      return this;
    },
    exec: () => Promise.resolve(replies),
  };
}

function rejectingPipeline(err: Error): DedupePipeline {
  return {
    set() {
      return this;
    },
    get() {
      return this;
    },
    exec: () => Promise.reject(err),
  };
}

describe('MeteringDedupeManager', () => {
  let manager: MeteringDedupeManager;
  let redis: jest.Mocked<DedupeRedis>;
  let commands: RecordedCommand[];

  beforeEach(async () => {
    commands = [];
    redis = {
      pipeline: jest.fn(),
      del: jest.fn().mockResolvedValue(1),
      quit: jest.fn().mockResolvedValue('OK'),
      disconnect: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        MeteringDedupeManager,
        { provide: MeteringRedisConfig, useValue: MockMeteringRedisConfig },
        { provide: MeteringDedupeRedisClient, useValue: redis },
      ],
    }).compile();

    manager = moduleRef.get(MeteringDedupeManager);
  });

  describe('claim', () => {
    it('returns claimed for keys that were newly set', async () => {
      redis.pipeline.mockReturnValueOnce(
        pipelineReturning(
          [
            [null, 'OK'],
            [null, 'claimed'],
            [null, 'OK'],
            [null, 'claimed'],
          ],
          commands
        )
      );

      await expect(manager.claim(['vpn:e1', 'vpn:e2'])).resolves.toEqual([
        'claimed',
        'claimed',
      ]);
    });

    it('claims and reads each key in a single round trip', async () => {
      redis.pipeline.mockReturnValueOnce(
        pipelineReturning(
          [
            [null, 'OK'],
            [null, 'claimed'],
          ],
          commands
        )
      );

      await manager.claim(['vpn:e1']);

      expect(redis.pipeline).toHaveBeenCalledTimes(1);
      expect(commands).toEqual([
        {
          command: 'set',
          args: [
            'vpn:e1',
            'claimed',
            'EX',
            MockMeteringRedisConfig.claimTtlSeconds,
            'NX',
          ],
        },
        { command: 'get', args: ['vpn:e1'] },
      ]);
    });

    it('marks an already-stored key as a duplicate', async () => {
      redis.pipeline.mockReturnValueOnce(
        pipelineReturning(
          [
            [null, null],
            [null, 'stored'],
          ],
          commands
        )
      );

      await expect(manager.claim(['vpn:e1'])).resolves.toEqual(['duplicate']);
    });

    it('marks a key claimed by an unfinished batch as pending', async () => {
      redis.pipeline.mockReturnValueOnce(
        pipelineReturning(
          [
            [null, null],
            [null, 'claimed'],
          ],
          commands
        )
      );

      await expect(manager.claim(['vpn:e1'])).resolves.toEqual(['pending']);
    });

    it('keeps statuses aligned when claims and duplicates are mixed', async () => {
      redis.pipeline.mockReturnValueOnce(
        pipelineReturning(
          [
            [null, null],
            [null, 'stored'],
            [null, 'OK'],
            [null, 'claimed'],
            [null, null],
            [null, 'claimed'],
          ],
          commands
        )
      );

      await expect(
        manager.claim(['vpn:e1', 'vpn:e2', 'vpn:e3'])
      ).resolves.toEqual(['duplicate', 'claimed', 'pending']);
    });

    it('makes no redis calls for an empty key list', async () => {
      await expect(manager.claim([])).resolves.toEqual([]);

      expect(redis.pipeline).not.toHaveBeenCalled();
    });

    it('wraps a rejected pipeline in DedupeError', async () => {
      redis.pipeline.mockReturnValueOnce(
        rejectingPipeline(new Error('connection closed'))
      );

      await expect(manager.claim(['vpn:e1'])).rejects.toThrow(DedupeError);
    });

    it('wraps a per-command redis error in DedupeError', async () => {
      redis.pipeline.mockReturnValueOnce(
        pipelineReturning([[new Error('OOM'), null]], commands)
      );

      await expect(manager.claim(['vpn:e1'])).rejects.toThrow(DedupeError);
    });
  });

  describe('confirm', () => {
    it('re-sets each key as stored with the full dedupe TTL', async () => {
      redis.pipeline.mockReturnValueOnce(
        pipelineReturning([[null, 'OK']], commands)
      );

      await manager.confirm(['vpn:e1']);

      expect(commands).toEqual([
        {
          command: 'set',
          args: [
            'vpn:e1',
            'stored',
            'EX',
            MockMeteringRedisConfig.dedupeTtlSeconds,
          ],
        },
      ]);
    });

    it('makes no redis calls for an empty key list', async () => {
      await manager.confirm([]);

      expect(redis.pipeline).not.toHaveBeenCalled();
    });

    it('wraps a rejected pipeline in DedupeError', async () => {
      redis.pipeline.mockReturnValueOnce(
        rejectingPipeline(new Error('connection closed'))
      );

      await expect(manager.confirm(['vpn:e1'])).rejects.toThrow(DedupeError);
    });
  });

  describe('release', () => {
    it('deletes the claimed keys', async () => {
      await manager.release(['vpn:e1', 'vpn:e2']);

      expect(redis.del).toHaveBeenCalledWith('vpn:e1', 'vpn:e2');
    });

    it('makes no redis calls for an empty key list', async () => {
      await manager.release([]);

      expect(redis.del).not.toHaveBeenCalled();
    });

    it('wraps a redis failure in DedupeError', async () => {
      redis.del.mockRejectedValue(new Error('connection closed'));

      await expect(manager.release(['vpn:e1'])).rejects.toThrow(DedupeError);
    });
  });

  describe('onApplicationShutdown', () => {
    it('quits the redis connection', async () => {
      await manager.onApplicationShutdown();

      expect(redis.quit).toHaveBeenCalled();
      expect(redis.disconnect).not.toHaveBeenCalled();
    });

    it('force-disconnects when quit fails', async () => {
      redis.quit.mockRejectedValue(new Error('connection closed'));

      await manager.onApplicationShutdown();

      expect(redis.disconnect).toHaveBeenCalled();
    });
  });
});
