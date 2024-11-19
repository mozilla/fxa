/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { SmsManager } from './sms.manager';
import { OtpManager } from '@fxa/shared/otp';
import { RecoveryPhoneServiceConfig } from './recovery-phone.service.config';
import { RecoveryPhoneManager } from './recovery-phone.manager';
import { RecoveryNumberNotSupportedError } from './recovery-phone.errors';

@Injectable()
export class RecoveryPhoneService {
  constructor(
    private readonly recoveryPhoneManager: RecoveryPhoneManager,
    private readonly smsManager: SmsManager,
    private readonly otpCode: OtpManager,
    private readonly config: RecoveryPhoneServiceConfig
  ) {}

  /**
   * Setups (ie registers) a new phone number to an account uid. Accomplishes setup
   * by sending the phone number provided an OTP code to verify.
   * @param uid The account id
   * @param phoneNumber The phone number to register
   * @returns True if code was sent and stored
   */
  public async setupPhoneNumber(uid: string, phoneNumber: string) {
    if (this.config.allowedNumbers) {
      const allowed = this.config.allowedNumbers.some((check) => {
        return phoneNumber.startsWith(check);
      });

      if (!allowed) {
        throw new RecoveryNumberNotSupportedError(uid, phoneNumber);
      }
    }

    const code = await this.otpCode.generateCode();
    await this.smsManager.sendSMS({
      to: phoneNumber,
      body: code,
    });
    await this.recoveryPhoneManager.storeUnconfirmed(
      uid,
      phoneNumber,
      code,
      true
    );
    return true;
  }

  /**
   * Confirms a UID code. This will also and finalizes the phone number setup if the code provided was
   * intended for phone number setup.
   * @param uid An account id
   * @param code A otp code
   * @returns True if successful
   */
  public async confirmCode(uid: string, code: string) {
    const data = await this.recoveryPhoneManager.getUnconfirmed(uid, code);

    // If there is no data, it means there's no record of this code being sent to the uid provided
    if (data == null) {
      return false;
    }

    // If this was for a setup operation. Register the phone number to the uid.
    if (data.isSetup === true) {
      await this.recoveryPhoneManager.registerPhoneNumber(
        uid,
        data.phoneNumber
      );
    }

    // There was a record matching, the uid / code. The confirmation was successful.
    return true;
  }
}
