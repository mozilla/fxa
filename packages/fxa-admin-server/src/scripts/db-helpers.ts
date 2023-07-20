/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { uuidTransformer } from 'fxa-shared/db/transformers';
import {
  Device,
  Email,
  Account,
  SessionToken,
  SignInCodes,
} from 'fxa-shared/db/models/auth';
import crypto from 'crypto';
import {
  setupAuthDatabase,
  setupDatabase,
  setupProfileDatabase,
} from 'fxa-shared/db';

const toRandomBuff = (size: number) =>
  uuidTransformer.to(crypto.randomBytes(size).toString('hex'));

export const toZeroBuff = (size: number) => Buffer.from(Array(size).fill(0));

const sessionToken = (
  uid: string,
  createdAt: number,
  lastAccessTime: number
) => ({
  id: toRandomBuff(32).toString('hex'),
  data: toRandomBuff(32).toString('hex'),
  tokenVerificationId: toRandomBuff(16).toString('hex'),
  uid,
  createdAt,
  lastAccessTime,
  location: {
    city: 'pdx',
    state: 'or',
    stateCode: 'or',
    country: 'usa',
    countryCode: 'usa',
  },
  uaBrowser: '',
  uaBrowserVersion: '',
  uaOS: '',
  uaOSVersion: '',
  uaDeviceType: '',
  uaFormFactor: '',
  mustVerify: false,
});

const device = (uid: string, sessionTokenId: string, createdAt: number) => {
  return {
    id: toRandomBuff(16).toString('hex'),
    uid,
    sessionTokenId,
    refreshTokenId: undefined,
    name: undefined,
    type: undefined,
    createdAt,
    pushCallback: undefined,
    pushPublicKey: undefined,
    pushAuthKey: undefined,
    availableCommands: undefined,
  };
};

const account = (uid: string, email: string, createdAt: number) => ({
  uid,
  createdAt,
  email,
  emailCode: toZeroBuff(16).toString('hex'),
  normalizedEmail: email,
  emailVerified: false,
  verifierVersion: 1,
  verifyHash: toZeroBuff(32).toString('hex'),
  authSalt: toZeroBuff(32).toString('hex'),
  kA: toZeroBuff(32).toString('hex'),
  wrapWrapKb: toZeroBuff(32).toString('hex'),
  verifierSetAt: createdAt,
  locale: 'en-US',
});

const signInCode = (uid: string, createdAt: number) => ({
  hash: toRandomBuff(32),
  flowid: toRandomBuff(32),
  uid: uuidTransformer.to(uid),
  createdAt,
});

export async function scaffoldDb(
  uid: string,
  email: string,
  createdAt: number,
  lastAccessTime: number
) {
  const token = sessionToken(uid, createdAt, lastAccessTime);
  const act = account(uid, email, createdAt);

  await Account.create(act);

  await SessionToken.create(token);
  await Device.create(device(uid, token.id, createdAt));
  const code = signInCode(uid, createdAt);
  await SignInCodes.knexQuery().insert(code);
}

// export async function connectToDb(config, log) {
//   const Token = require('../../../lib/tokens')(log, config);
//   const UnblockCode = require('../../../lib/crypto/random').base32(
//     config.signinUnblock.codeLength
//   );
//   const db = require('../../../lib/db')(config, log, Token, UnblockCode);

//   await db.connect(Object.assign({}, config, { log: { level: 'error' } }));
//   return db;
// }

export async function clearDb() {
  await Email.knexQuery().del();
  await Account.knexQuery().del();
  await Device.knexQuery().del();
  await SessionToken.knexQuery().del();
  await SignInCodes.knexQuery().del();
}

export enum TargetDB {
  auth,
  oauth,
  profile,
}

export function bindKnex(dbConfig: any, db: TargetDB = TargetDB.auth) {
  switch (db) {
    case TargetDB.oauth:
      return setupDatabase(dbConfig);
    case TargetDB.profile:
      return setupProfileDatabase(dbConfig);
    case TargetDB.auth:
    default:
      return setupAuthDatabase(dbConfig);
  }
}
