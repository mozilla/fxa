/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Redis } from 'ioredis';
import { BlockStatus, Rule, BlockOn, BlockOnOpts } from './models';
import { ActionNotFound, MissingOption } from './error';
import {
  createBlockRecord,
  createBlockStatus,
  getBanKey,
  getKey,
  getLargestRetryAfter,
  parseBlockRecord,
} from './util';

import { StatsD } from '@fxa/shared/metrics/statsd';

/**
 * Class that controls 'rate-limiting' specific actions.
 * This used to be customs-server, but has been simplified quite a bit by
 * using explicit configuration and a more generalized approach to defining rules.
 */
export class RateLimit {
  /**
   * Creates a new RateLimit instance
   * @param rules A set of rules. See parseRules in config for more info!
   * @param redis A Redis client
   */
  constructor(
    public readonly config: {
      rules: Record<string, Rule[]>;
      ignoreIPs?: Array<string>;
      ignoreEmails?: Array<string>;
      ignoreUIDs?: Array<string>;
    },
    private readonly redis: Redis,
    private readonly statsd?: StatsD
  ) {}

  /**
   * Clears blocks for the provided ip, email, or uid.
   * @param opts Pass as many of these in as needed. Rules for these will be removed.
   */
  async unblock(opts: BlockOnOpts) {
    const keys = new Set<string>();

    for (const action in this.config.rules) {
      for (const rule of this.config.rules[action]) {
        const blockedValue = opts[rule.blockingOn];
        if (blockedValue) {
          keys.add(getKey('block', action, rule, blockedValue));
          keys.add(getKey('attempts', action, rule, blockedValue));
          this.statsd?.increment(`rate_limit.unblock`, [
            `on:${rule.blockingOn}`,
            `action:${action}`,
          ]);
        }
      }
    }

    await Promise.all(Array.from(keys).map((x: string) => this.redis.del(x)));
  }

  /**
   * Clears bans for the provided ip, email, or uid
   * @param opts
   */
  async unban(opts: BlockOnOpts) {
    const keys = new Set<string>();

    for (const action in this.config.rules) {
      for (const rule of this.config.rules[action]) {
        const blockedValue = opts[rule.blockingOn];
        if (blockedValue) {
          keys.add(getBanKey(rule.blockingOn, blockedValue));
          keys.add(getKey('attempts', action, rule, blockedValue));
          this.statsd?.increment(`rate_limit.unban`, [
            `on:${rule.blockingOn}`,
            `action:${action}`,
          ]);
        }
      }
    }

    await Promise.all(Array.from(keys).map((x: string) => this.redis.del(x)));
  }

  /**
   * Checks to see if there are rules for a given action.
   * @param action - Name of action
   * @returns - True if action has rules, otherwise false.
   */
  supportsAction(action: string) {
    return (
      this.config.rules['default'] != null || this.config.rules[action] != null
    );
  }

  /**
   * Determines if a check can be skipped, due to an ignored ip, email, or uid.
   * When testing and developing it's often helpful to disable customs rules for
   * certain users.
   * @param opts - The current properties being checked.
   * @returns
   */
  skip(opts: BlockOnOpts) {
    if (opts.ip != null && this.config.ignoreIPs?.some((x) => opts.ip === x)) {
      this.statsd?.increment('rate_limit.ignore.ip');
      return true;
    }

    if (
      opts.uid != null &&
      this.config.ignoreUIDs?.some((x) => opts.uid === x)
    ) {
      this.statsd?.increment('rate_limit.ignore.uid');
      return true;
    }

    if (
      opts.email != null &&
      this.config.ignoreEmails?.some((x) => opts.email?.match(x))
    ) {
      this.statsd?.increment('rate_limit.ignore.email');
      return true;
    }

    return false;
  }

  /**
   * Checks to see if a rate limit has been exceeded.
   * @param action The action being conducted. Important, if the action is not defined, a runtime error will occur!
   * @param opts Pass as many of these in as possible! If a rule requires one of these options
   *             and it is not specified a runtime error will occur!
   * @returns Null if no block is found. Or a status containing info about the block.
   */
  async check(action: string, opts: BlockOnOpts): Promise<BlockStatus | null> {
    // Important! Set timestamp of check upfront.
    // This reduces small variance because of wait on IO operations.
    const now = Date.now();

    // First, check if user is banned. If so they should be rejected right away. This
    // also the lightest check.
    const bans = await this.findBans(now, opts);
    if (bans.length > 0) {
      return getLargestRetryAfter(bans);
    }

    // Second, see if there's any outstanding blocks. If so they should get blocked
    // right away
    const rules = this.findRules(action, opts);
    const blocks = await this.findBlocks(now, action, rules);

    // If an active block is located, short circuit and return the block
    const block = this.determineBlockStatus(action, blocks);
    if (block) {
      return block;
    }

    // Otherwise, start counting attempts for applicable rules.
    const newBlocks = new Array<BlockStatus>();
    const addAttempt = async (rule: Rule, blockedValue: string) => {
      // Check to see if there are any blocks or bans that currently exist in Redis.
      // Create a new block/ban and add set of openBlocks.
      const attemptsKey = getKey('attempts', action, rule, blockedValue);

      const attempts = await this.redis.incr(attemptsKey);
      if (attempts === 1) {
        await this.redis.expire(attemptsKey, rule.windowDurationInSeconds);
      }

      // If we've exceeded the max number of attempts
      if (attempts > rule.maxAttempts) {
        const block = createBlockRecord(
          now,
          action,
          blockedValue,
          attempts,
          rule,
          false
        );

        newBlocks.push(createBlockStatus(now, block));

        const key = (() => {
          switch (rule.blockPolicy) {
            case 'ban':
              return getBanKey(rule.blockingOn, blockedValue);
            case 'block':
              return getKey(rule.blockPolicy, action, rule, blockedValue);
            case 'report':
              return getKey(rule.blockPolicy, action, rule, blockedValue);
            default:
              throw new Error('Unknown block policy: ' + rule.blockPolicy);
          }
        })();
        const json = JSON.stringify(block);

        await this.redis.set(key, json);
        await Promise.all([
          this.redis.expire(key, rule.blockDurationInSeconds),
          this.redis.expire(attemptsKey, 0),
        ]);
      }
    };

    // Fire off an attempt for each applicable rule.
    await Promise.all(rules.map((x) => addAttempt(x.rule, x.blockedValue)));

    // If new blocks were added, return the one with the largest retryAfter value.
    return this.determineBlockStatus(action, newBlocks);
  }

  /**
   * Determines which block should be used. The block with longest duration should
   * be reported to the end user. Note that blocks with a policy of 'report' will
   * still emit metrics, but these block will never be returned, and therefore cannot
   * result in a 'block'.
   * @param action target action
   * @param blocks set of applicable rules
   * @returns Block with policy of type 'block' and the largest retryAfter value.
   */
  private determineBlockStatus(
    action: string,
    blocks: BlockStatus[]
  ) {
    // Blocks with a 'report' policy, are only reported. Don't return this block, but still emit
    // metrics indicating it may have resulted in block.
    const reportOnlyBlock = getLargestRetryAfter(blocks.filter((x) => x.policy === 'report'));
    if (reportOnlyBlock) {
      this.statsd?.increment(`rate_limit.${reportOnlyBlock.policy}`, [
        `on:${reportOnlyBlock.blockingOn}`,
        `action:${action}`,
      ]);
    }

    // Next the block with the longest retry after. This is what we actually return in order
    // to initiate a block.
    const block = getLargestRetryAfter(blocks.filter(x => x.policy !== 'report'));
    if (block) {
      this.statsd?.increment(`rate_limit.${block.policy}`, [
        `on:${block.blockingOn}`,
        `action:${action}`,
      ]);
    }

    return block;
  }

  /**
   * Looks up rules for the given action. Also ensures that correct options are being provided, and will
   * error out if action or option is missing.
   * @param action - The target action
   * @param opts - The set of blocking options. e.g. ip, ip_email.
   * @returns Set of rules with accompanying blockedValues.
   * @throws ActionNotFound, MissingOption
   */
  private findRules(
    action: string,
    opts: BlockOnOpts
  ): Array<{ rule: Rule; isDefault: boolean; blockedValue: string }> {
    let rules = this.config.rules[action];

    let isDefault = false;
    if (!rules) {
      isDefault = true;
      const defaultRules = this.config.rules['default'];
      if (defaultRules?.length > 0) {
        rules = defaultRules;
      } else {
        throw new ActionNotFound(action);
      }
    }

    return rules.map((rule) => {
      const blockedValue = opts[rule.blockingOn];

      // Make sure the correct values were passed in as opts.
      // If an action requires an email, ip, ip_email, and/or uid, it must provided!
      if (!blockedValue) {
        throw new MissingOption(action, rule.blockingOn);
      }

      return { rule, isDefault, blockedValue };
    });
  }

  /**
   * Finds active blocks
   * @param now - Current time of check
   * @param rules - Applicable rules
   * @returns Set of BlockStatus for matching blocks
   */
  private async findBlocks(
    now: number,
    action: string,
    rules: { rule: Rule; blockedValue: string }[]
  ) {
    const blocks = new Array<BlockStatus>();
    const check = async (blockKey: string) => {
      const json = await this.redis.get(blockKey);
      const blockRecord = parseBlockRecord(json);
      if (blockRecord) {
        blocks.push(createBlockStatus(now, blockRecord));
      }
    };

    await Promise.all(
      rules.map(({ rule, blockedValue }) => {
        const blockKey = getKey(rule.blockPolicy, action, rule, blockedValue);
        return check(blockKey);
      })
    );

    return blocks;
  }

  /**
   * Finds active bans
   * @param now - Current time of check
   * @param opts - Blocking options
   * @returns Set of BlockStatus for matching bans
   */
  private async findBans(now: number, opts: BlockOnOpts) {
    const bans = new Array<BlockStatus>();
    const check = async (blockOn: BlockOn, value?: string) => {
      if (value) {
        const banKey = getBanKey(blockOn, value);
        const json = await this.redis.get(banKey);
        const blockRecord = parseBlockRecord(json);
        if (blockRecord) {
          bans.push(createBlockStatus(now, blockRecord));
        }
      }
    };
    await Promise.all([
      check('email', opts.email),
      check('ip', opts.ip),
      check('ip_email', opts.ip_email),
      check('uid', opts.uid),
    ]);
    return bans;
  }
}
