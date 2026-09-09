/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  AccountDatabase,
  AccountDbProvider,
} from '@fxa/shared/db/mysql/account';
import { Inject, Injectable } from '@nestjs/common';
import {
  getConfirmedPhoneNumber,
  getCountByPhoneNumber,
  hasRecoveryCodes,
  registerPhoneNumber,
  removePhoneNumber,
  changePhoneNumber,
} from './recovery-phone.repository';
import {
  RecoveryNumberAlreadyExistsError,
  RecoveryNumberInvalidFormatError,
  RecoveryNumberNotExistsError,
  RecoveryNumberReplaceNotExistsError,
} from './recovery-phone.errors';
import { Redis } from 'ioredis';
import { PhoneNumberInstance } from 'twilio/lib/rest/lookups/v2/phoneNumber';
import { bufferEqualsConstantTime } from '@fxa/shared/crypto';

const RECORD_EXPIRATION_SECONDS = 5 * 60;

/**
 *
 */
export type PhoneNumberLookupData = ReturnType<
  typeof PhoneNumberInstance.prototype.toJSON
>;

/**
 * Standard prefix for all recovery phone entries in redis.
 */
export const RECOVERY_PHONE_REDIS_PREFIX = 'recovery-phone:sms-attempt';

/**
 * Key for the single live sms code of a user. Keying on the uid alone lets a
 * write overwrite the previous code, so no keyspace scan is needed.
 */
const unconfirmedKey = (uid: string) => `${RECOVERY_PHONE_REDIS_PREFIX}:${uid}`;

@Injectable()
export class RecoveryPhoneManager {
  constructor(
    @Inject(AccountDbProvider) private readonly db: AccountDatabase,
    @Inject('RecoveryPhoneRedis') private readonly redisClient: Redis
  ) {}

  private isE164Format(phoneNumber: string) {
    const e164Regex = /^\+?[1-9]\d{1,14}$/;
    return e164Regex.test(phoneNumber);
  }

  /**
   * Register a phone number for account recovery.
   *
   * @throws {RecoveryNumberAlreadyExistsError} if the phone number is already registered.
   * @param uid
   * @param phoneNumber Phone number in E.164 format.
   */
  async registerPhoneNumber(
    uid: string,
    phoneNumber: string,
    lookupData: PhoneNumberLookupData
  ): Promise<any> {
    if (!this.isE164Format(phoneNumber)) {
      throw new RecoveryNumberInvalidFormatError(uid, phoneNumber);
    }
    const uidBuffer = Buffer.from(uid, 'hex');
    const now = Date.now();
    try {
      await registerPhoneNumber(this.db, {
        uid: uidBuffer,
        phoneNumber,
        createdAt: now,
        lastConfirmed: now,
        lookupData: JSON.stringify(lookupData),
      });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new RecoveryNumberAlreadyExistsError(uid, phoneNumber);
      }
      throw err;
    }
  }

  /**
   * Get the confirmed phone number for a user.
   *
   * @param uid
   */
  async getConfirmedPhoneNumber(uid: string): Promise<{
    uid: Buffer;
    phoneNumber: string;
    nationalFormat?: string;
  }> {
    const uidBuffer = Buffer.from(uid, 'hex');
    const result = await getConfirmedPhoneNumber(this.db, uidBuffer);
    if (!result) {
      throw new RecoveryNumberNotExistsError(uid);
    }
    return result;
  }

  /**
   * Remove account phone number.
   *
   * @param uid
   */
  async removePhoneNumber(uid: string): Promise<boolean> {
    const uidBuffer = Buffer.from(uid, 'hex');
    const removed = await removePhoneNumber(this.db, uidBuffer);

    if (!removed) {
      throw new RecoveryNumberNotExistsError(uid);
    }

    return true;
  }

  /**
   * Replaces an existing phone number with a new one.
   *
   * @param uid The user's unique identifier
   * @param phoneNumber The new phone number to replace the existing one
   * @param lookupData Lookup data for twilio cross-check
   */
  async changePhoneNumber(
    uid: string,
    phoneNumber: string,
    lookupData: PhoneNumberLookupData
  ): Promise<boolean> {
    const uidBuffer = Buffer.from(uid, 'hex');
    const now = Date.now();
    const results = await changePhoneNumber(this.db, {
      uid: uidBuffer,
      phoneNumber,
      lastConfirmed: now,
      createdAt: now,
      lookupData: JSON.stringify(lookupData),
    });

    if (results < 1) {
      throw new RecoveryNumberReplaceNotExistsError(uid);
    }
    return true;
  }

  /**
   * Store phone number data and SMS code for a user. Overwrites any existing
   * record, so a uid only ever has one code live at a time.
   *
   * @param uid The user's unique identifier
   * @param code The SMS code to associate with this UID
   * @param phoneNumber The phone number to store
   * @param isSetup Flag indicating if this SMS is to set up a number or verify an existing one
   * @param lookupData Optional lookup data for the phone number
   */
  async storeUnconfirmed(
    uid: string,
    code: string,
    phoneNumber: string,
    isSetup: boolean,
    lookupData?: PhoneNumberLookupData
  ): Promise<void> {
    const data = {
      createdAt: Date.now(),
      code,
      phoneNumber,
      isSetup,
      lookupData: lookupData ? JSON.stringify(lookupData) : null,
    };

    await this.redisClient.set(
      unconfirmedKey(uid),
      JSON.stringify(data),
      'EX',
      RECORD_EXPIRATION_SECONDS
    );
  }

  /**
   * Retrieve phone number data for a user using uid and sms code.
   *
   * @param uid The user's unique identifier
   * @param code The SMS code associated with this user
   * @returns The stored phone number data if found, or null if not found
   */
  async getUnconfirmed(
    uid: string,
    code: string
  ): Promise<{
    phoneNumber: string;
    isSetup: boolean;
    lookupData: Record<string, any> | null;
  } | null> {
    const data = await this.redisClient.get(unconfirmedKey(uid));

    if (data) {
      const record = JSON.parse(data);
      if (bufferEqualsConstantTime(code, record.code)) {
        return record;
      }
    }

    return null;
  }

  /**
   * Removes the user's unconfirmed code record so it cannot be used again.
   *
   * @param uid The user's unique identifier
   * @returns True if a record was removed
   */
  async removeCode(uid: string) {
    const count = await this.redisClient.del(unconfirmedKey(uid));
    return count > 0;
  }

  /**
   * Check if a user has recovery codes. Recovery codes are required
   * to set up a recovery phone.
   *
   * @param uid The user's unique identifier
   */
  async hasRecoveryCodes(uid: string): Promise<boolean> {
    return hasRecoveryCodes(this.db, Buffer.from(uid, 'hex'));
  }

  async getCountByPhoneNumber(phoneNumber: string) {
    return getCountByPhoneNumber(this.db, phoneNumber);
  }
}
