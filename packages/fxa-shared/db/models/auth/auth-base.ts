/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseModel } from '../base';

export enum Proc {
  AccountRecord = 'accountRecord_7',
  AccountResetToken = 'accountResetToken_1',
  AccountDevices = 'accountDevices_16',
  Device = 'device_3',
  DeviceFromTokenVerificationId = 'deviceFromTokenVerificationId_6',
  EmailBounces = 'fetchEmailBounces_1',
  KeyFetchToken = 'keyFetchToken_1',
  KeyFetchTokenWithVerificationStatus = 'keyFetchTokenWithVerificationStatus_2',
  PasswordChangeToken = 'passwordChangeToken_3',
  PasswordForgotToken = 'passwordForgotToken_2',
  RecoveryKey = 'getRecoveryKey_4',
  SessionWithDevice = 'sessionWithDevice_19',
  Sessions = 'sessions_11',
  TotpToken = 'totpToken_2',
}

function callString(name: Proc, argCount: number) {
  const qs = new Array(argCount).fill('?').join(',');
  return `Call ${name}(${qs})`;
}

export abstract class AuthBaseModel extends BaseModel {
  static async callProcedure(name: Proc, ...args: any[]) {
    const knex = this.knex();
    const [result] = await knex.raw(callString(name, args.length), args);
    return result[0] as object[];
  }
}
