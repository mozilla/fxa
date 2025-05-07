/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import crypto from 'crypto';
import { BaseModel } from '../base';
import { Knex } from 'knex';

export enum Proc {
  AccountRecord = 'accountRecord_10',
  AccountResetToken = 'accountResetToken_2',
  AccountDevices = 'accountDevices_17',
  ConsumeRecoveryCode = 'consumeRecoveryCode_3',
  ConsumeSigninCode = 'consumeSigninCode_4',
  ConsumeUnblockCode = 'consumeUnblockCode_4',
  CreateAccount = 'createAccount_12',
  CreateDevice = 'createDevice_5',
  CreateEmail = 'createEmail_2',
  CreateEmailBounce = 'createEmailBounce_3',
  CreateKeyFetchToken = 'createKeyFetchToken_2',
  CreatePasswordChangeToken = 'createPasswordChangeToken_2',
  CreatePasswordForgotToken = 'createPasswordForgotToken_2',
  CreateRecoveryCode = 'createRecoveryCode_3',
  CreateRecoveryKey = 'createRecoveryKey_4',
  CreateSecurityEvent = 'createSecurityEvent_5',
  CreateSessionToken = 'createSessionToken_10',
  CreateSigninCode = 'createSigninCode_2',
  CreateTotpToken = 'createTotpToken_1',
  CreateUnblockCode = 'createUnblockCode_1',
  DeleteAccount = 'deleteAccount_20',
  DeleteAccountResetToken = 'deleteAccountResetToken_1',
  DeleteDevice = 'deleteDevice_4',
  DeleteEmail = 'deleteEmail_5',
  DeleteKeyFetchToken = 'deleteKeyFetchToken_2',
  DeletePasswordChangeToken = 'deletePasswordChangeToken_1',
  DeletePasswordForgotToken = 'deletePasswordForgotToken_1',
  DeleteRecoveryCodes = 'deleteRecoveryCodes_1',
  DeleteRecoveryKey = 'deleteRecoveryKey_2',
  DeleteSessionToken = 'deleteSessionToken_4',
  DeleteTotpToken = 'deleteTotpToken_4',
  Device = 'device_3',
  DeviceFromTokenVerificationId = 'deviceFromTokenVerificationId_6',
  EmailBounces = 'fetchEmailBounces_3',
  FindLargeAccounts = 'findLargeAccounts_1',
  ForgotPasswordVerified = 'forgotPasswordVerified_9',
  KeyFetchToken = 'keyFetchToken_1',
  KeyFetchTokenWithVerificationStatus = 'keyFetchTokenWithVerificationStatus_2',
  LimitSessions = 'limitSessions_3',
  PasswordChangeToken = 'passwordChangeToken_3',
  PasswordForgotToken = 'passwordForgotToken_3',
  PurgeAvailableCommands = 'purgeAvailableCommands_1',
  Prune = 'prune_10',
  RecoveryCodes = 'recoveryCodes_1',
  RecoveryKey = 'getRecoveryKey_4',
  ResetAccount = 'resetAccount_19',
  ResetAccountTokens = 'resetAccountTokens_1',
  SessionWithDevice = 'sessionWithDevice_19',
  Sessions = 'sessions_13',
  SetPrimaryEmail = 'setPrimaryEmail_6',
  TotpToken = 'totpToken_2',
  UpdateDevice = 'updateDevice_6',
  UpdateRecoveryKey = 'updateRecoveryKey_1',
  UpdateSessionToken = 'updateSessionToken_3',
  UpdateTotpToken = 'updateTotpToken_4',
  UpsertAvailableCommands = 'upsertAvailableCommand_1',
  VerifyEmail = 'verifyEmail_9',
  VerifyToken = 'verifyToken_3',
  VerifyTokenWithMethod = 'verifyTokensWithMethod_3',
}

function callString(name: Proc, argCount: number, outputs?: string[]) {
  const qs = new Array(argCount)
    .fill('?')
    .concat(outputs || [])
    .join(',');
  return `Call ${name}(${qs})`;
}

export type QueryStatus = {
  fieldCount: number;
  affectedRows: number;
  insertId: number;
  serverStatus: number;
  warningCount: number;
  message: string;
  protocol41: boolean;
  changedRows: number;
};

export abstract class BaseAuthModel extends BaseModel {
  static async callProcedure(
    name: Proc,
    txn: Knex.Transaction,
    ...args: any[]
  ): Promise<{ status: QueryStatus; rows: any[] }>;
  static async callProcedure(
    name: Proc,
    ...args: any[]
  ): Promise<{ status: QueryStatus; rows: any[] }>;
  static async callProcedure(name: Proc, ...args: any[]) {
    let [txn, ...rest] = args;
    const knex = this.knex() as Knex;
    const query =
      txn && typeof txn.commit === 'function'
        ? knex.raw(callString(name, rest.length), rest).transacting(txn)
        : knex.raw(callString(name, args.length), args);
    const [result] = await query;
    if (Array.isArray(result)) {
      return { status: result.pop(), rows: result.shift() };
    }
    return { status: result, rows: [] };
  }

  static async callProcedureWithOutputs(
    name: Proc,
    args: any[],
    outputs: string[]
  ) {
    const { query, knex } = this.callProcedureRaw(args, name, outputs);
    await query;
    return await knex.select(knex.raw(outputs.join(','))).first();
  }

  static async callProcedureWithOutputsAndQueryResults(
    name: Proc,
    args: any[],
    outputs: string[]
  ) {
    const { query, knex } = this.callProcedureRaw(args, name, outputs);
    const [result] = await query;
    return {
      outputs: await knex.select(knex.raw(outputs.join(','))).first(),
      results: { status: result.pop(), rows: result },
    };
  }

  private static callProcedureRaw(args: any[], name: Proc, outputs: string[]) {
    let [txn, ...rest] = args;
    const knex = this.knex() as Knex;
    const query =
      txn && typeof txn.commit === 'function'
        ? knex
            .raw(callString(name, rest.length, outputs), rest)
            .transacting(txn)
        : knex.raw(callString(name, args.length, outputs), args);
    return { query, knex };
  }

  static sha256(hex: string | Buffer) {
    const data = typeof hex === 'string' ? Buffer.from(hex, 'hex') : hex;
    return crypto.createHash('sha256').update(data).digest();
  }
}
