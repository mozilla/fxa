/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseModel } from '../base';
import { Knex } from 'knex';

export enum Proc {
  AccountRecord = 'accountRecord_7',
  AccountResetToken = 'accountResetToken_1',
  AccountDevices = 'accountDevices_16',
  CreateAccount = 'createAccount_9',
  CreateDevice = 'createDevice_5',
  CreateKeyFetchToken = 'createKeyFetchToken_2',
  CreatePasswordChangeToken = 'createPasswordChangeToken_2',
  CreatePasswordForgotToken = 'createPasswordForgotToken_2',
  CreateRecoveryKey = 'createRecoveryKey_4',
  CreateSessionToken = 'createSessionToken_9',
  CreateTotpToken = 'createTotpToken_1',
  DeleteAccount = 'deleteAccount_19',
  DeleteAccountResetToken = 'deleteAccountResetToken_1',
  DeleteDevice = 'deleteDevice_4',
  DeleteKeyFetchToken = 'deleteKeyFetchToken_2',
  DeletePasswordChangeToken = 'deletePasswordChangeToken_1',
  DeletePasswordForgotToken = 'deletePasswordForgotToken_1',
  DeleteRecoveryKey = 'deleteRecoveryKey_2',
  DeleteSessionToken = 'deleteSessionToken_4',
  DeleteTotpToken = 'deleteTotpToken_4',
  Device = 'device_3',
  DeviceFromTokenVerificationId = 'deviceFromTokenVerificationId_6',
  EmailBounces = 'fetchEmailBounces_1',
  KeyFetchToken = 'keyFetchToken_1',
  KeyFetchTokenWithVerificationStatus = 'keyFetchTokenWithVerificationStatus_2',
  PasswordChangeToken = 'passwordChangeToken_3',
  PasswordForgotToken = 'passwordForgotToken_2',
  RecoveryKey = 'getRecoveryKey_4',
  ResetAccount = 'resetAccount_16',
  SessionWithDevice = 'sessionWithDevice_18',
  Sessions = 'sessions_11',
  TotpToken = 'totpToken_2',
  UpdateSessionToken = 'updateSessionToken_3',
  UpsertAvailableCommands = 'upsertAvailableCommand_1',
}

function callString(name: Proc, argCount: number) {
  const qs = new Array(argCount).fill('?').join(',');
  return `Call ${name}(${qs})`;
}

export abstract class AuthBaseModel extends BaseModel {
  static async callProcedure(
    name: Proc,
    txn: Knex.Transaction,
    ...args: any[]
  ): Promise<object[]>;
  static async callProcedure(name: Proc, ...args: any[]): Promise<object[]>;
  static async callProcedure(name: Proc, ...args: any[]) {
    let [txn, ...rest] = args;
    const knex = this.knex() as Knex;
    const query =
      txn && typeof txn.commit === 'function'
        ? knex.raw(callString(name, rest.length), rest).transacting(txn)
        : knex.raw(callString(name, args.length), args);
    const [result] = await query;
    return result[0] as object[];
  }
}
