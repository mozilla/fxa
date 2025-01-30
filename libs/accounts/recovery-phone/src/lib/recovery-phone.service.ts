/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { SmsManager } from './sms.manager';
import { OtpManager } from '@fxa/shared/otp';
import { RecoveryPhoneConfig } from './recovery-phone.service.config';
import {
  PhoneNumberLookupData,
  RecoveryPhoneManager,
} from './recovery-phone.manager';
import {
  RecoveryNumberNotExistsError,
  RecoveryNumberNotSupportedError,
  RecoveryPhoneNotEnabled,
  RecoveryNumberRemoveMissingBackupCodes,
} from './recovery-phone.errors';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';
import { LOGGER_PROVIDER } from '@fxa/shared/log';

@Injectable()
export class RecoveryPhoneService {
  constructor(
    private readonly recoveryPhoneManager: RecoveryPhoneManager,
    private readonly smsManager: SmsManager,
    private readonly otpCode: OtpManager,
    private readonly config: RecoveryPhoneConfig,
    @Inject(LOGGER_PROVIDER) private readonly log?: LoggerService
  ) {}

  /**
   * Checks to see if a user can set up a recovery phone number. This is based on the
   * user's region, if they have backup codes, or if they already set up a recovery phone.
   *
   * @param uid
   * @param region
   */
  public async available(uid: string, region: string): Promise<boolean> {
    if (!this.config.enabled) {
      throw new RecoveryPhoneNotEnabled();
    }

    if (!this.config.allowedRegions?.includes(region)) {
      return false;
    }

    const hasConfirmed = await this.hasConfirmed(uid);
    if (hasConfirmed.exists) {
      return false;
    }

    // User can set up a recovery phone if they have backup codes
    return await this.recoveryPhoneManager.hasRecoveryCodes(uid);
  }

  /**
   * Setups (ie registers) a new phone number to an account uid. Accomplishes setup
   * by sending the phone number provided an OTP code to verify.
   * @param uid The account id
   * @param phoneNumber The phone number to register
   * @param localizedMessageBody Optional localized message body
   * @returns True if code was sent and stored
   */
  public async setupPhoneNumber(
    uid: string,
    phoneNumber: string,
    getFormattedMessage?: (code: string) => Promise<string>
  ) {
    if (!this.config.enabled) {
      throw new RecoveryPhoneNotEnabled();
    }

    if (this.config.sms && this.config.sms.validNumberPrefixes) {
      const allowed = this.config.sms.validNumberPrefixes.some((check) => {
        return phoneNumber.startsWith(check);
      });

      if (!allowed) {
        throw new RecoveryNumberNotSupportedError(phoneNumber);
      }
    }

    // Invalidate and remove any or all previous unconfirmed code entries
    const unconfirmedKeys = await this.recoveryPhoneManager.getAllUnconfirmed(
      uid
    );
    for (const key of unconfirmedKeys) {
      const code = key.split(':').pop();
      if (code) {
        await this.recoveryPhoneManager.removeCode(uid, code);
      }
    }

    const code = await this.otpCode.generateCode();

    await this.recoveryPhoneManager.storeUnconfirmed(
      uid,
      code,
      phoneNumber,
      true
    );

    const formattedSMSbody = getFormattedMessage
      ? await getFormattedMessage(code)
      : undefined;

    const smsBody = formattedSMSbody || `${code}`;

    const msg = await this.smsManager.sendSMS({
      to: phoneNumber,
      body: smsBody,
    });

    return this.isSuccessfulSmsSend(msg);
  }

  /**
   * Confirms a UID code. This will also and finalizes the phone number setup if the code provided was
   * intended for phone number setup.
   * @param uid An account id
   * @param code A otp code
   * @returns True if successful
   */
  public async confirmSetupCode(uid: string, code: string) {
    if (!this.config.enabled) {
      throw new RecoveryPhoneNotEnabled();
    }

    const data = await this.recoveryPhoneManager.getUnconfirmed(uid, code);

    // If there is no data, it means there's no record of this code being sent to the uid provided
    if (data == null) {
      return false;
    }

    // The code must be intended for a setup, ie recovery phone create, action.
    if (data.isSetup !== true) {
      return false;
    }

    // If this was for a setup operation. Register the phone number to the uid.
    const lookupData: PhoneNumberLookupData = await (async () => {
      try {
        return await this.smsManager.phoneNumberLookup(data.phoneNumber);
      } catch (error) {
        this.log?.error('RecoveryPhoneService.confirmSetupCode', error);

        throw new RecoveryNumberNotSupportedError(data.phoneNumber, error);
      }
    })();

    await this.recoveryPhoneManager.registerPhoneNumber(
      uid,
      data.phoneNumber,
      lookupData
    );

    // The code was valid. Remove entry. It cannot be used again.
    await this.recoveryPhoneManager.removeCode(uid, code);

    // There was a record matching, the uid / code. The confirmation was successful.
    return true;
  }

  /**
   * Confirms a signin code.
   * @param uid An account id
   * @param code A otp code
   * @returns True if successful
   */
  public async confirmSigninCode(uid: string, code: string) {
    if (!this.config.enabled) {
      throw new RecoveryPhoneNotEnabled();
    }

    const data = await this.recoveryPhoneManager.getUnconfirmed(uid, code);

    // If there is no data, it means there's no record of this code being sent to the uid provided
    if (data == null) {
      return false;
    }

    // A code intended for setup, cannot be used for sign in.
    if (data.isSetup === true) {
      return false;
    }

    // The code was valid. Remove entry. It cannot be used again.
    await this.recoveryPhoneManager.removeCode(uid, code);

    return true;
  }

  /**
   * Remove phone number from an account. Each user can only have one associated
   * phone number. A user must have backup codes before removing a phone number.
   *
   * @param uid An account id
   * @returns True if successful
   */
  public async removePhoneNumber(uid: string) {
    if (!this.config.enabled) {
      throw new RecoveryPhoneNotEnabled();
    }

    const hasRecoveryCodes = await this.recoveryPhoneManager.hasRecoveryCodes(
      uid
    );

    // TBD: Random, obs. why do we do this? It seems like a potential edge case, what if the user
    // consumes all the recovery codes? This could then return false...
    //
    // Just curious, about the rationale surrounding why this would block a user from removing their
    // phone.
    //
    if (!hasRecoveryCodes) {
      throw new RecoveryNumberRemoveMissingBackupCodes(uid);
    }

    return await this.recoveryPhoneManager.removePhoneNumber(uid);
  }

  /**
   * Checks if the given uid has confirmed a phone number.
   * @param uid Account id
   * @param phoneNumberMask When provided will mask the number so the full value is not shown.
   * @returns If the account has confirmed, returns {exists:true, phoneNumber }. If not returns {exists:false}
   *
   * @remarks The value provided for phoneNumberMask will preserve the last N digits of of the phone number.
   * e.g. If the phone number was +15005551234 and phoneNumberMask was 4, the result would be +*******1234.
   */
  public async hasConfirmed(
    uid: string,
    phoneNumberMask?: number
  ): Promise<{
    exists: boolean;
    phoneNumber?: string;
  }> {
    if (!this.config.enabled) {
      throw new RecoveryPhoneNotEnabled();
    }

    try {
      const { phoneNumber } =
        await this.recoveryPhoneManager.getConfirmedPhoneNumber(uid);

      return {
        exists: true,
        phoneNumber: this.maskPhoneNumber(phoneNumber, phoneNumberMask),
      };
    } catch (err) {
      if (err instanceof RecoveryNumberNotExistsError) {
        // no-op - we handle the error, and just return false;
        return {
          exists: false,
          phoneNumber: undefined,
        };
      }
      // Something unexpected happened...
      throw err;
    }
  }

  /**
   * Masks a phone number so as to not divulge the entire value.
   *
   * @param phoneNumber The actual phone number
   * @param lastN The last N number of digits to show
   * @returns A masked number
   *
   * @remarks This will not mask a + symbol, since this technically isn't part of the
   * number. e.g. +15005551234 would be masked as +*******1234 if lastN was 4.
   */
  public maskPhoneNumber(phoneNumber: string, lastN?: number) {
    if (!this.config.enabled) {
      throw new RecoveryPhoneNotEnabled();
    }

    // The + notation can be confusing in a masked number. Don't count it
    // as a digit.
    let prefix = '';
    if (phoneNumber.startsWith('+')) {
      prefix = '+';
      phoneNumber = phoneNumber.substring(1);
    }

    // Clamp lastN between 0 and phoneNumber.length
    if (lastN === undefined) {
      lastN = phoneNumber.length;
    } else if (lastN > phoneNumber.length) {
      lastN = phoneNumber.length;
    } else if (lastN < 0) {
      lastN = 0;
    }

    // Create mask
    const maskedPhoneNumber = phoneNumber
      .substring(phoneNumber.length - lastN)
      .padStart(phoneNumber.length, '•');
    return `${prefix}${maskedPhoneNumber}`;
  }

  /**
   * Sends an totp code to a user
   * @param uid Account id
   * @param getFormattedMessage Optional template function to format the message
   * @returns True if message didn't fail to send.
   */
  public async sendCode(
    uid: string,
    getFormattedMessage?: (code: string) => Promise<string>
  ) {
    if (!this.config.enabled) {
      throw new RecoveryPhoneNotEnabled();
    }

    const { phoneNumber } =
      await this.recoveryPhoneManager.getConfirmedPhoneNumber(uid);
    const code = await this.otpCode.generateCode();
    await this.recoveryPhoneManager.storeUnconfirmed(
      uid,
      code,
      phoneNumber,
      false
    );

    const formattedSMSbody = getFormattedMessage
      ? await getFormattedMessage(code)
      : undefined;

    const smsBody = formattedSMSbody || `${code}`;

    const msg = await this.smsManager.sendSMS({
      to: phoneNumber,
      body: smsBody,
    });

    return this.isSuccessfulSmsSend(msg);
  }

  private isSuccessfulSmsSend(msg: MessageInstance) {
    if (
      msg == null ||
      msg.status === 'failed' ||
      msg.status === 'canceled' ||
      msg.status === 'undelivered'
    ) {
      return false;
    }

    // TBD: Need to check other message states?

    return true;
  }
}
