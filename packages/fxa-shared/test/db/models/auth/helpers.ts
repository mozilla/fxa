/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import fs from 'fs';
import path from 'path';

import Chance from 'chance';
import { knex, Knex } from 'knex';

import {
  Account,
  BaseAuthModel,
  EmailBounce,
} from '../../../../db/models/auth';
import { randomBytes } from 'crypto';

export type AccountIsh = Pick<
  Account,
  'uid' | 'email' | 'emails' | 'normalizedEmail'
>;
export type BounceIsh = Pick<
  EmailBounce,
  | 'bounceSubType'
  | 'bounceType'
  | 'createdAt'
  | 'email'
  | 'emailTypeId'
  | 'diagnosticCode'
>;

export const chance = new Chance();

export function randomGuid() {
  return chance.guid({ version: 4 }).replace(/-/g, '');
}

export function randomAccount() {
  const email = chance.email();
  return {
    authSalt: '00',
    createdAt: chance.timestamp(),
    email,
    emailCode: '00',
    emailVerified: true,
    kA: '00',
    normalizedEmail: email,
    uid: randomGuid(),
    verifierSetAt: chance.timestamp(),
    verifierVersion: 0,
    verifyHash: '00',
    wrapWrapKb: '00',
  };
}

export function randomEmail(account: AccountIsh, primary = true) {
  return {
    createdAt: chance.timestamp(),
    email: account.email,
    emailCode: '00000000000000000000000000000000',
    isPrimary: primary,
    isVerified: true,
    normalizedEmail: account.normalizedEmail,
    uid: account.uid,
  };
}

export function randomEmailBounce(
  email: string,
  withDiagnosticCode: boolean = false
): BounceIsh {
  return {
    bounceSubType: chance.integer({ min: 0, max: 14 }),
    bounceType: chance.integer({ min: 0, max: 3 }),
    createdAt: chance.timestamp(),
    emailTypeId: chance.integer({ min: 1, max: 30 }),
    email,
    diagnosticCode: withDiagnosticCode ? 'smtp; 550 user unknown' : '',
  };
}

export function randomTotp(account: AccountIsh) {
  return {
    uid: account.uid,
    sharedSecret: 'abcd1234',
    epoch: 0,
    createdAt: chance.timestamp(),
    verified: true,
    enabled: true,
  };
}

function generateRandomHexValue(): string {
  // Generate 32 random bytes (64 hex digits)
  return randomBytes(32).toString('hex').toUpperCase();
}

export function randomBackupCode(account: AccountIsh) {
  return {
    uid: account.uid,
    codeHash: generateRandomHexValue(),
    salt: generateRandomHexValue(),
  };
}

export function randomRecoveryPhone(account: AccountIsh) {
  const randomTimestamp = chance.timestamp();
  return {
    uid: account.uid,
    phoneNumber: '1234567890',
    createdAt: randomTimestamp,
    lastConfirmed: randomTimestamp + 10,
    lookupData: {},
  };
}

export function randomRecoveryKey(account: AccountIsh) {
  return {
    uid: account.uid,
    recoveryData: 'abcd1234',
    recoveryKeyIdHash:
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    createdAt: chance.timestamp(),
    verifiedAt: chance.timestamp(),
    enabled: true,
  };
}

export function randomLinkedAccount(account: AccountIsh) {
  return {
    uid: account.uid,
    providerId: 1,
    id: Math.random() * 10000,
    authAt: Date.now(),
    enabled: true,
  };
}

export function randomSessionToken(
  account: AccountIsh,
  lastAccessTime: number
) {
  return {
    tokenId: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    tokenData:
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    uid: account.uid,
    createdAt: new Date(lastAccessTime - 2 * 60 * 60 * 1e3).getTime(),
    uaBrowser: 'Chrome',
    uaBrowserVersion: '89.0.4389',
    uaOS: 'Mac OS X',
    uaOSVersion: '11.2.1',
    uaDeviceType: 'desktop',
    lastAccessTime,
    uaFormFactor: 'abcd1234',
    authAt: chance.timestamp(),
    verificationMethod: 1,
    verifiedAt: chance.timestamp(),
    mustVerify: false,
  };
}

export function randomDeviceToken(sessionTokenId: string) {
  return {
    id: '0123456789abcdef',
    sessionTokenId,
    name: 'Pocket',
    pushEndpointExpired: false,
    availableCommands: {},
    location: {},
  };
}

export function randomOauthClient(last_access_time: number) {
  return {
    refresh_token_id:
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    created_time: new Date(last_access_time - 60 * 60 * 1e3).getTime(),
    last_access_time,
    scope: [],
    client_id: '0123456789abcdef',
    client_name: 'oauth 1',
  };
}

export async function testAuthDatabaseSetup(instance: Knex): Promise<void> {
  BaseAuthModel.knex(instance);

  const runSql = async (filePaths: string[]) =>
    Promise.all(
      filePaths
        .map((x) => path.join(__dirname, x))
        .map((x) => fs.readFileSync(x, 'utf8'))
        .map((x) => instance.raw.bind(instance)(x))
    );

  await runSql([
    './accounts.sql',
    './account-reset-tokens.sql',
    './devices.sql',
    './emails.sql',
    './account-customers.sql',
    './paypal-ba.sql',
    './email-types.sql',
    './email-bounces.sql',
    './metadata.sql',
    './password-change-tokens.sql',
    './password-forgot-tokens.sql',
    './totp.sql',
    './recovery-keys.sql',
    './session-tokens.sql',
    './signin-codes.sql',
    './linked-accounts.sql',
    './deviceCommandIdentifiers.sql',
    './unblock-codes.sql',
    './unverified-tokens.sql',
    './recovery-codes.sql',
    './recovery-phones.sql',
  ]);
  // The order matters for inserts or foreign key refs
  await runSql([
    './insert-email-types.sql',
    './sent-emails.sql',
    './deviceCommands.sql',
    './sp_accountDevices.sql',
    './sp_prune.sql',
    './sp_limitSessions.sql',
    './sp_findLargeAccounts.sql',
  ]);

  /*/ Debugging Assistance
  knex.on('query', (data) => {
    console.dir(data);
  });
  //*/
}
