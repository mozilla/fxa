/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const {
  Device,
  Email,
  Account,
  SessionToken,
  SignInCodes,
} = require('fxa-shared/db/models/auth');
const { uuidTransformer } = require('fxa-shared/db/transformers');
const crypto = require('crypto');

export const toZeroBuff = (size) =>
  Buffer.from(Array(size).fill(0), 'hex').toString('hex');

export const toRandomBuff = (size) =>
  uuidTransformer.to(crypto.randomBytes(size).toString('hex'));

export async function clearDb() {
  await Email.knexQuery().del();
  await Account.knexQuery().del();
  await Device.knexQuery().del();
  await SessionToken.knexQuery().del();
  await SignInCodes.knexQuery().del();
}

export async function connectToDb(config, log) {
  const Token = require('../../../lib/tokens')(log, config);
  const UnblockCode = require('../../../lib/crypto/random').base32(
    config.signinUnblock.codeLength
  );
  const db = require('../../../lib/db')(config, log, Token, UnblockCode);

  await db.connect(Object.assign({}, config, { log: { level: 'error' } }));
  return db;
}

const account = (uid, email, createdAt) => ({
  uid,
  createdAt,
  email,
  emailCode: toZeroBuff(16),
  normalizedEmail: email,
  emailVerified: false,
  verifierVersion: 1,
  verifyHash: toZeroBuff(32),
  authSalt: toZeroBuff(32),
  kA: toZeroBuff(32),
  wrapWrapKb: toZeroBuff(32),
  verifierSetAt: createdAt,
  locale: 'en-US',
});

const device = (uid, sessionTokenId, createdAt) => {
  return {
    id: toRandomBuff(16),
    uid,
    sessionTokenId,
    refreshTokenId: null,
    name: null,
    type: null,
    createdAt,
    pushCallback: null,
    pushPublicKey: null,
    pushAuthKey: null,
    availableCommands: null,
  };
};

const sessionToken = (uid, createdAt, lastAccessTime) => ({
  id: toRandomBuff(32),
  data: toRandomBuff(32),
  tokenVerificationId: null,
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
});

const signInCode = (uid, createdAt) => ({
  hash: toRandomBuff(32),
  flowid: toRandomBuff(32),
  uid,
  createdAt,
});

export async function scaffoldDb(uid, email, createdAt, lastAccessTime) {
  const tUid = uuidTransformer.to(uid);
  const token = sessionToken(tUid, createdAt, lastAccessTime);

  await Account.create(account(tUid, email, createdAt));
  await SessionToken.create(token);
  await Device.create(device(tUid, token.id, createdAt));
  await SignInCodes.knexQuery().insert(signInCode(tUid, createdAt));
}
