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
}
