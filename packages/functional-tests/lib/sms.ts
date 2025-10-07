/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Twilio } from 'twilio';
import Redis from 'ioredis';
import type { Redis as RedisType } from 'ioredis';
import { TargetName, getFromEnv, getFromEnvWithFallback } from './targets';

// Default test number, see Twilio test credentials phone numbers:
// https://www.twilio.com/docs/iam/test-credentials
export const TEST_NUMBER = '4159929960';

function wait() {
  return new Promise((r) => setTimeout(r, 500));
}

export class SmsClient {
  private readonly twilioClient?: Twilio;
  private readonly redisClient?: RedisType;
  private readonly uidCodes: Map<string, string>;
  private lastCode: string | undefined;
  private redisClientConnected = false;
  private hasLoggedRedisConnectionError = false;
  private _connecting = false;
  private phoneLockKey: string | undefined;
  private phoneLockToken: string | undefined;

  constructor(public readonly targetName: TargetName) {
    const accountSid = getFromEnv(
      'FUNCTIONAL_TESTS__TWILIO__ACCOUNT_SID',
      targetName
    );
    const apiKey = getFromEnv('FUNCTIONAL_TESTS__TWILIO__API_KEY', targetName);
    const apiSecret = getFromEnv(
      'FUNCTIONAL_TESTS__TWILIO__API_SECRET',
      targetName
    );
    const authToken = getFromEnv(
      'FUNCTIONAL_TESTS__TWILIO__ACCOUNT_AUTH_TOKEN',
      targetName
    );
    const enableRedis = getFromEnvWithFallback(
      'FUNCTIONAL_TESTS__REDIS__ENABLED',
      targetName,
      targetName === 'local' ? 'true' : 'false'
    );

    // When testing local or in CI pipe, we should enable redis.
    if (enableRedis === 'true') {
      this._connecting = true;
      this.redisClient = new Redis();
      this.redisClient.on('ready', () => {
        this._connecting = false;
        this.redisClientConnected = true;
        this.hasLoggedRedisConnectionError = false;
      });

      this.redisClient.on('error', (err: Error) => {
        this._connecting = false;
        if (!this.hasLoggedRedisConnectionError) {
          this.hasLoggedRedisConnectionError = true;
        }
        this.redisClientConnected = false;
      });
    } else {
      if (accountSid && apiKey && apiSecret) {
        this.twilioClient = new Twilio(apiKey, apiSecret, {
          accountSid,
        });
      } else if (accountSid && authToken) {
        this.twilioClient = new Twilio(apiKey, authToken);
      }
    }
    this.uidCodes = new Map();
  }

  isTwilioEnabled() {
    return !!this.twilioClient;
  }

  isRedisEnabled() {
    return !!this.redisClient;
  }

  /**
   * Checks if phone number locking is available, based on Redis availability.
   * @returns
   */
  isPhoneLockingAvailable() {
    return this.isRedisEnabled();
  }

  usingRealTestPhoneNumber() {
    return this.getPhoneNumber() !== TEST_NUMBER;
  }

  /**
   * Gets the sent SMS code for an account uid. If no number is provided
   * `this.getPhoneNumber()` is used to get a default.
   * @returns
   */
  async getCode({
    uid,
    phoneNumber = this.getPhoneNumber(),
    timeout = 10000,
  }: {
    uid: string;
    phoneNumber?: string;
    timeout?: number;
  }) {
    if (this.isTwilioEnabled()) {
      // When using a real phone number with Twilio, different workers may
      // race to read the latest message for the same number. If Redis is
      // available, take a short-lived distributed lock to serialize access.
      if (this.isRedisEnabled()) {
        return await this.withPhoneLock(async () => {
          return this._getCodeTwilio(phoneNumber);
        }, phoneNumber);
      }
      return this._getCodeTwilio(phoneNumber);
    } else {
      return this._getCodeLocal(uid, timeout);
    }
  }

  /**
   * Important! Twilio does not allow you to fetch messages when using test
   * credentials. Twilio also does not allow you to send messages to magic
   * test numbers with real credentials.
   *
   * Therefore, if a 'magic' test number is configured, then we need to
   * use redis to peek at codes sent out, and if a 'real' testing phone
   * number is being being used, then we need to check the Twilio API for
   * the message sent out and look at the code within.
   *
   * Two conditions are checked:
   *  - If a `real` number is configured and Twilio is NOT enabled
   *  - If a `fake` number is configured and Redis is NOT enabled
   *
   * An error is thrown if either condition is met.
   *
   * Usage:
   * ``` typescript
   * test.describe('phone number tests', () => {
   *    test.beforeAll(({target}) => {
   *       // call in beforeAll to ensure proper configuration
   *       target.smsClient.guardTestPhoneNumber();
   *    });
   * })
   * ```
   */
  guardTestPhoneNumber() {
    const usingRealNumber = this.usingRealTestPhoneNumber();
    const isTwilioEnabled = this.isTwilioEnabled();
    const isRedisEnabled = this.isRedisEnabled();

    if (usingRealNumber && !isTwilioEnabled) {
      throw new Error('Twilio must be enabled when using a real test number.');
    }
    if (!usingRealNumber && !isRedisEnabled) {
      throw new Error('Redis must be enabled when using a test number.');
    }

    // Optional enforcement to check if phone number locking is available.
    // Unsure if we need this, but it could be valuable to troubleshoot should
    // we encounter issues with phone number locking.
    if (
      process.env.FUNCTIONAL_TESTS__PHONE_LOCK_REQUIRED === 'true' &&
      !this.isPhoneLockingAvailable()
    ) {
      throw new Error(
        'Redis must be enabled to use phone-number locking across workers.'
      );
    }
  }

  /**
   * Acquire an exclusive lock for the configured phone number so a test can
   * perform multiple steps (send code, sign out/in, read code) without other
   * workers interfering. Returns a release function to be called in finally.
   *
   * It's preferred to use the `withPhoneLock` method instead, as it wraps this
   * and handles the release of the lock.
   *
   * Example:
   *   const release = await target.smsClient.acquirePhoneLock();
   *   try {
   *     // do steps that cause SMS to be sent and then read it
   *   } finally {
   *     await release();
   *   }
   *
   * @param phoneNumber - The phone number to lock.
   * @param lockTtlMs - The time to live for the lock.
   * @param acquireTimeoutMs - The timeout for acquiring the lock.
   * @param autoRenew - Whether to auto-renew the lock.
   * @returns A release function to be called in finally.
   */
  async acquirePhoneLock(
    phoneNumber = this.getPhoneNumber(),
    lockTtlMs = 30000,
    acquireTimeoutMs = 15000,
    autoRenew = false
  ): Promise<() => Promise<void>> {
    if (!this.redisClient) {
      return async () => {};
    }
    const lockKey = `recovery-phone:lock:${phoneNumber}`;
    const lockToken = `${process.pid}-${Date.now()}-${Math.random()}`;
    const acquireBy = Date.now() + acquireTimeoutMs;

    while (Date.now() < acquireBy) {
      try {
        const result = await this.redisClient.set(
          lockKey,
          lockToken,
          'PX',
          lockTtlMs,
          'NX'
        );
        if (result === 'OK') {
          this.phoneLockKey = lockKey;
          this.phoneLockToken = lockToken;
          let renewTimer: ReturnType<typeof setInterval> | undefined;
          if (autoRenew) {
            renewTimer = setInterval(
              async () => {
                try {
                  const redisClientRef = this.redisClient;
                  if (!redisClientRef) {
                    return;
                  }
                  const current = await redisClientRef.get(lockKey);
                  if (current === lockToken) {
                    await redisClientRef.pexpire(lockKey, lockTtlMs);
                  }
                } catch (_err) {
                  void 0;
                }
              },
              Math.max(1000, Math.floor(lockTtlMs / 2))
            );
          }

          const release = async () => {
            if (renewTimer) clearInterval(renewTimer);
            await this._releasePhoneLock(lockKey, lockToken);
            if (this.phoneLockKey === lockKey) this.phoneLockKey = undefined;
            if (this.phoneLockToken === lockToken)
              this.phoneLockToken = undefined;
          };
          return release;
        }
      } catch (_err) {
        void 0;
      }
      await wait();
    }

    // Could not acquire; return no-op releaser
    return async () => {};
  }

  /**
   * Manages performing operations with a phone number while holding a lock on
   * the phone number. Allows for parallelization on functional tests that require
   * sharing the same phone number.
   *
   * Please note, if a large number of tests are running in parallel that use the same
   * phone number, it's possible for a deadlock and tests will start to timeout
   * while waiting for an available unlock.
   *
   * An additional pitfall is how tests run in CI...
   * Today, tests run in parallel CI containers, which means they don't share the Redis instance.
   * FxA also has a limit of 5 accounts with the same phone number. So, it's possible for
   * parallel containers with parallel tests to "consume" all 5 accounts with the same phone number.
   */
  async withPhoneLock<T>(
    fn: () => Promise<T>,
    phoneNumber = this.getPhoneNumber(),
    lockTtlMs = 30000
  ): Promise<T> {
    const release = await this.acquirePhoneLock(phoneNumber, lockTtlMs);
    try {
      return await fn();
    } finally {
      await release();
    }
  }

  /**
   * Checks the process env for a configured twilio test phone number. Defaults
   * to generic magic test number if one is not provided.
   * @param targetName The test target name. eg local, stage, prod.
   * @returns
   */
  getPhoneNumber() {
    if (this.targetName === 'local') {
      return TEST_NUMBER;
    }
    return getFromEnvWithFallback(
      'FUNCTIONAL_TESTS__TWILIO__TEST_NUMBER',
      this.targetName,
      TEST_NUMBER
    );
  }

  async _getCodeTwilio(
    recipientNumber: string,
    limit = 1,
    codeRegex = /\b\d{6}\b/,
    timeout = 10000,
    startTime = Date.now() - 1000
  ): Promise<string> {
    if (!this.twilioClient) {
      throw new Error('Twilio API not enabled');
    }

    const expires = Date.now() + timeout;

    while (Date.now() < expires) {
      const messages = await this.twilioClient.messages.list({
        to: recipientNumber,
        dateSentAfter: new Date(startTime),
        limit,
      });

      if (!messages.length) {
        await wait();
        continue;
      }

      const lastMessage = messages[0];
      const match = lastMessage.body.match(codeRegex);

      if (!match) {
        await wait();
        continue;
      }

      const code = match[0];
      if (code === this.lastCode) {
        await wait();
        continue;
      }

      this.lastCode = code;
      return code;
    }

    throw new Error('Timeout: No new code found within the specified time');
  }

  /**
   * Get the code stored in redis that was sent to the user via SMS.
   *
   * @param uid
   * @param timeout
   */
  async _getCodeLocal(uid: string, timeout = 10000): Promise<string> {
    while (this._connecting) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (!this.redisClient) {
      throw new Error('Not connected to Redis');
    }
    if (!this.redisClientConnected) {
      throw new Error('Not connected to Redis');
    }

    const redisKeyPattern = `recovery-phone:sms-attempt:${uid}:*`;
    const expires = Date.now() + timeout;

    while (Date.now() < expires) {
      let cursor = '0';
      let newestKey: string | null = null;
      let newestCreatedAt = -1;

      do {
        const [newCursor, keys] = await this.redisClient.scan(
          cursor,
          'MATCH',
          redisKeyPattern
        );
        cursor = newCursor;

        for (const key of keys) {
          const valueRaw = await this.redisClient.get(key);

          if (valueRaw === null) continue;
          let value;
          try {
            value = JSON.parse(valueRaw);
          } catch (err) {
            continue;
          }
          if (
            typeof value !== 'object' ||
            value === null ||
            typeof value.createdAt !== 'number'
          )
            continue;

          if (!newestKey || value.createdAt > newestCreatedAt) {
            newestKey = key;
            newestCreatedAt = value.createdAt;
          }
        }
      } while (cursor !== '0');

      // If no keys are found, wait and try again.
      if (!newestKey) {
        await wait();
        continue;
      }

      const code = newestKey.split(':')[3];
      const lastCode = this.uidCodes.get(uid);

      // If the code is the same as the last one, wait and try again.
      if (lastCode === code) {
        await wait();
        continue;
      }

      this.uidCodes.set(uid, code);
      return code;
    }

    throw new Error('KeyTimeout');
  }

  /**
   * Release the phone lock using a basic check-and-del pattern to avoid
   * releasing someone else's lock.
   */
  private async _releasePhoneLock(lockKey: string, token: string) {
    if (!this.redisClient) return;
    try {
      const current = await this.redisClient.get(lockKey);
      if (current === token) {
        await this.redisClient.del(lockKey);
      }
    } catch (_err) {
      // Best effort; ignore
    }
  }
}
