/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Device, Email, Account, SessionToken, SignInCodes } from 'fxa-shared/db/models/auth';

import { uuidTransformer } from 'fxa-shared/db/transformers';
import crypto from 'crypto';

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
