/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { SessionToken } from 'fxa-shared/connected-services/models/SessionToken';
import { Email, SecurityEvent } from 'fxa-shared/db/models/auth';
import { EVENT_NAMES } from 'fxa-shared/db/models/auth/security-event';

export type GetTokensFn<T> = (uid: string) => Promise<T[]>;
export type ActiveConditionFn = (
  uid: string,
  activeByDateTimestamp: number
) => Promise<boolean> | Promise<Promise<boolean>>;
export type NoTimestampActiveConditionFn = (
  uid: string
) => Promise<boolean> | Promise<Promise<boolean>>;

// this includes the agumented last access time from redis
export const hasActiveSessionToken = async (
  tokensFn: GetTokensFn<SessionToken>,
  uid: string,
  activeByDateTimestamp: number
) => {
  const sessionTokens = await tokensFn(uid);
  return sessionTokens.some(
    (token) =>
      token.lastAccessTime && token.lastAccessTime >= activeByDateTimestamp
  );
};
export const hasActiveRefreshToken = async (
  tokensFn: GetTokensFn<{ lastUsedAt: number }>,
  uid: string,
  activeByDateTimestamp: number
) => {
  const refreshTokens = await tokensFn(uid);
  return refreshTokens.some((t) => t.lastUsedAt >= activeByDateTimestamp);
};
export const hasAccessToken = async (
  tokensFn: GetTokensFn<{ lastUsedAt: number }>,
  uid: string
) => {
  const accessTokens = await tokensFn(uid);
  return accessTokens.length > 0;
};

export const emailVerificationQuery = (uid, activeByDateTimestamp) =>
  Email.query()
    .select('uid')
    .where('uid', uid)
    .andWhere('verifiedAt', '>=', activeByDateTimestamp)
    .limit(1)
    .first();

export const securityEventsQuery = (uid, activeByDateTimestamp) =>
  SecurityEvent.query()
    .select('uid')
    .where('uid', uid)
    .andWhere('createdAt', '>=', activeByDateTimestamp)
    .whereIn('nameId', [
      EVENT_NAMES['account.login'],
      EVENT_NAMES['account.password_reset_success'],
      EVENT_NAMES['account.password_changed'],
    ])
    .limit(1)
    .first();
