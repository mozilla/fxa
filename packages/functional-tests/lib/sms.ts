/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Twilio } from 'twilio';
import Redis from 'ioredis';
import type { Redis as RedisType } from 'ioredis';
import { TargetName, getFromEnv, getFromEnvWithFallback } from './targets';

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

  constructor(public readonly targetName: TargetName) {
    const accountSid = getFromEnv(
      'FUNCTIONAL_TESTS__SMS_CLIENT__TWILIO__ACCOUNT_SID',
      targetName
    );
    const apiKey = getFromEnv(
      'FUNCTIONAL_TESTS__SMS_CLIENT__TWILIO__ACCOUNT_API_KEY',
      targetName
    );
    const apiSecret = getFromEnv(
      'FUNCTIONAL_TESTS__SMS_CLIENT__TWILIO__ACCOUNT_API_SECRET',
      targetName
    );
    const authToken = getFromEnv(
      'FUNCTIONAL_TESTS__SMS_CLIENT__TWILIO__ACCOUNT_AUTH_TOKEN',
      targetName
    );
    const enableRedis = getFromEnvWithFallback(
      'FUNCTIONAL_TESTS__SMS_CLIENT__REDIS__ENABLED',
      targetName,
      targetName === 'local' ? 'true' : 'false'
    );

    if (accountSid && apiKey && apiSecret) {
      this.twilioClient = new Twilio(apiKey, apiSecret, {
        accountSid,
      });
    } else if (accountSid && authToken) {
      this.twilioClient = new Twilio(apiKey, apiSecret, {
        accountSid,
      });
    }

    // When testing local or in CI pipe, we should enable redis.
    if (enableRedis === 'true') {
      this.redisClient = new Redis();
      this.redisClient.on('ready', () => {
        this.redisClientConnected = true;
        this.hasLoggedRedisConnectionError = false;
      });

      this.redisClient.on('error', (err: Error) => {
        if (!this.hasLoggedRedisConnectionError) {
          this.hasLoggedRedisConnectionError = true;
        }
        this.redisClientConnected = false;
      });
    }
    this.uidCodes = new Map();
  }

  isTwilioEnabled() {
    return !!this.twilioClient;
  }

  isRedisEnabled() {
    return !!this.redisClient;
  }

  async getCode(recipientNumber: string, uid: string, timeout = 10000) {
    if (this.isTwilioEnabled()) {
      return this._getCodeTwilio(recipientNumber);
    } else {
      return this._getCodeLocal(uid, timeout);
    }
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
