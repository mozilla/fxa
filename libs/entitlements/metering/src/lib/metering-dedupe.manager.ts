/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';

import { MeteringDedupeRedisClient } from './metering-dedupe.provider';
import { MeteringRedisConfig } from './metering-redis.config';
import { DedupeError } from './metering.error';
import type {
  DedupePipeline,
  DedupeRedis,
  DedupeStatus,
} from './metering.types';
import { toError } from './utils/toError';

const CLAIMED_VALUE = 'claimed';
const STORED_VALUE = 'stored';

@Injectable()
export class MeteringDedupeManager implements OnApplicationShutdown {
  constructor(
    private readonly meteringRedisConfig: MeteringRedisConfig,
    @Inject(MeteringDedupeRedisClient) private readonly redis: DedupeRedis
  ) {}

  async claim(keys: string[]): Promise<DedupeStatus[]> {
    if (keys.length === 0) {
      return [];
    }

    const claims = this.redis.pipeline();
    for (const key of keys) {
      claims.set(
        key,
        CLAIMED_VALUE,
        'EX',
        this.meteringRedisConfig.claimTtlSeconds,
        'NX'
      );
      claims.get(key);
    }
    const replies = await this.exec(claims, 'claim');

    return keys.map((_, index) => {
      if (replies[index * 2] === 'OK') {
        return 'claimed';
      }
      return replies[index * 2 + 1] === STORED_VALUE ? 'duplicate' : 'pending';
    });
  }

  async confirm(keys: string[]): Promise<void> {
    if (keys.length === 0) {
      return;
    }
    const pipeline = this.redis.pipeline();
    for (const key of keys) {
      pipeline.set(
        key,
        STORED_VALUE,
        'EX',
        this.meteringRedisConfig.dedupeTtlSeconds
      );
    }
    await this.exec(pipeline, 'confirm');
  }

  async release(keys: string[]): Promise<void> {
    if (keys.length === 0) {
      return;
    }
    try {
      await this.redis.del(...keys);
    } catch (err) {
      throw new DedupeError('release', toError(err));
    }
  }

  async onApplicationShutdown(): Promise<void> {
    try {
      await this.redis.quit();
    } catch {
      this.redis.disconnect();
    }
  }

  private async exec(
    pipeline: DedupePipeline,
    operation: string
  ): Promise<unknown[]> {
    let replies: Array<[Error | null, unknown]>;
    try {
      replies = await pipeline.exec();
    } catch (err) {
      throw new DedupeError(operation, toError(err));
    }

    const failure = replies.find(([err]) => err !== null)?.[0];
    if (failure) {
      throw new DedupeError(operation, failure);
    }
    return replies.map(([, reply]) => reply);
  }
}
