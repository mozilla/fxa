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

  usingRealTestPhoneNumber() {
    return this.getPhoneNumber() !== TEST_NUMBER;
  }


  async getCode(recipientNumber: string, uid: string, timeout = 10000) {
    if (this.isTwilioEnabled()) {
      return this._getCodeTwilio(recipientNumber);
    } else {
      return this._getCodeLocal(uid, timeout);
    }
  }

  /**
   * Guard function against misconfiguration of test phone numbers.
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
}
