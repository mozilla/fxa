/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Redis } from 'ioredis';
import { BlockStatus, BlockRecord, Rule, BlockReason } from './models';
import { ActionNotFound, MissingOption } from './error';

/**
 * Class the controls 'rate-limiting' specific actions.
 * This used to be customs0-server, but has been simplified quite a bit by
 * using explicit configuration and a more generalized approach to defining rules.
 */
export class RateLimit {
  /**
   * Creates a new RateLimit instance
   * @param rules A set of rules. See parseRules in config for more info!
   * @param redis A Redis client
   */
  constructor(
    public readonly rules: Record<string, Rule[]>,
    private readonly redis: Redis
  ) {}

  /**
   * Clears blocks for the provided ip, email, or uid.
   * @param opts Pass as many of these in as needed. Rules for these will be removed.
   * @returns Null if no block is found. Or a status containing info about the block.
   */
  async unblock(opts: { ip?: string; email?: string; uid?: string }) {
    for (const action in this.rules) {
      for (const rule of this.rules[action]) {
        const blockedValue = opts[rule.blockingOn]?.replace(':', ' ');
        if (blockedValue) {
          const attemptsKey = getKey('attempts', rule, blockedValue);
          const blockKey = getKey('block', rule, blockedValue);
          await Promise.all([
            this.redis.del(blockKey),
            this.redis.del(attemptsKey),
          ]);
        }
      }
    }
  }

  /**
   * Checks to see if a rate limit has been exceeded.
   * @param action The action being conducted. Important, if the action is not defined, a runtime error will occur!
   * @param opts Pass as many of these in as possible! If a rule requires one of these options
   *             and it is not specified a runtime error will occur!
   * @returns Null if no block is found. Or a status containing info about the block.
   */
  async check(
    action: string,
    opts: {
      ip?: string;
      email?: string;
      uid?: string;
    }
  ): Promise<BlockStatus | null> {
    // Make sure action actually exists
    const rules = this.rules[action];
    if (!rules) {
      throw new ActionNotFound(action);
    }

    const openBlocks = [];

    // Important! Set timestamp of check upfront.
    // This reduces small variance because of wait on IO operations.
    const now = Date.now();

    for (const rule of rules) {
      // Sanitize key. Space is a decent replacement character, because it's an invalid character for
      // ip addressees, emails, and user ids.
      const blockedValue = opts[rule.blockingOn];

      // Make sure the correct values were passed in as opts.
      // If an action requires an email, ip, and/or uid, it must provided!
      if (!blockedValue) {
        throw new MissingOption(action, rule.blockingOn);
      }

      // Check to see if there are any blocks that currently exist in Redis.
      // Create a new block and add set of openBlocks.
      const attemptsKey = getKey('attempts', rule, blockedValue);
      const blockKey = getKey('block', rule, blockedValue);

      let block = JSON.parse((await this.redis.get(blockKey)) || 'null');
      let attempts = 0;

      if (block === null) {
        attempts = await this.redis.incr(attemptsKey);
        if (attempts === 1) {
          await this.redis.expire(attemptsKey, rule.windowDurationInSeconds);
        }

        // If we've exceeded the max number of attempts, then create a block
        if (attempts > rule.maxAttempts) {
          block = {
            action: rule.action,
            startTime: now,
            duration: rule.blockDurationInSeconds,
            blockingOn: rule.blockingOn,
            blockedValue: blockedValue,
            reason: 'too-many-attempts',
            attempts: attempts,
          } satisfies BlockRecord;

          await this.redis.set(blockKey, JSON.stringify(block));

          await Promise.all([
            this.redis.expire(blockKey, rule.blockDurationInSeconds),
            this.redis.expire(attemptsKey, 0),
          ]);
        }
      }

      if (block !== null) {
        openBlocks.push({
          startTime: block.startTime,
          duration: block.duration,
          attempt: block.attempt,
          retryAfter: calculateRetryAfter(now, block),
          reason: 'too-many-attempts' as BlockReason,
          action: rule.action,
          blockingOn: rule.blockingOn,
        });
      }
    }

    // If blocks weren't found. Pick the block with the longest retry after.
    if (openBlocks.length > 0) {
      let block = openBlocks[0];
      openBlocks.forEach((x) => {
        if (x.retryAfter > block.retryAfter) {
          block = x;
        }
      });

      // TODO: Record metrics on this. We'd also like to improve these metrics and be able to
      //  answer the following questions:
      //    - What action was blocked, for what user, and on what condition (ie IP, uid, or email)
      //    - How long the user will be blocked for
      //    - Open question, do we also want to no blocks with shorter bans? Or just the block with largest
      //      ban (ie the biggest retryAfter value).

      return {
        ...block,
        openBlocks: openBlocks,
      };
    }

    // Made it through the gauntlet of rules. No blocks found!
    return null;
  }
}

/**
 * Generates a redis key
 */
export function getKey(
  type: 'block' | 'attempts',
  rule: Pick<Rule, 'blockingOn' | 'action'>,
  blockedValue: string
) {
  const sanitizedBlockedValue = blockedValue.replace(':', ' ');
  return `rate-limit:${type}:${rule.blockingOn}:${sanitizedBlockedValue}:${rule.action}`;
}

/**
 * Calculates the amount of time that must elapse in seconds before the action can be retried.
 * @param now The current time.
 * @param block The blocked record
 * @returns How log to wait in seconds before trying again.
 */
export function calculateRetryAfter(now: number, block: BlockRecord) {
  return block.duration * 1000 - (now - block.startTime);
}
