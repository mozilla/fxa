/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export const OAUTH_SCOPE_SUBSCRIPTIONS =
  'https://identity.mozilla.com/account/subscriptions';

export const OAUTH_SCOPE_OLD_SYNC = 'https://identity.mozilla.com/apps/oldsync';
export const OAUTH_SCOPE_RELAY = 'https://identity.mozilla.com/apps/relay';
export const OAUTH_SCOPE_SESSION_TOKEN =
  'https://identity.mozilla.com/tokens/session';
export const OAUTH_SCOPE_NEWSLETTERS =
  'https://identity.mozilla.com/account/newsletters';
export const OAUTH_SCOPE_SUBSCRIPTIONS_IAP = `${OAUTH_SCOPE_SUBSCRIPTIONS}/iap`;
export const SHORT_ACCESS_TOKEN_TTL_IN_MS = 1000 * 60 * 60 * 6;
// Maximum age an account is considered "new"; useful when sending
// notification emails
export const MAX_NEW_ACCOUNT_AGE = 1000 * 60 * 60 * 24;

export const OauthConsts = {
  OAUTH_SCOPE_OLD_SYNC,
  OAUTH_SCOPE_RELAY,
  OAUTH_SCOPE_SESSION_TOKEN,
  OAUTH_SCOPE_NEWSLETTERS,
  OAUTH_SCOPE_SUBSCRIPTIONS,
  OAUTH_SCOPE_SUBSCRIPTIONS_IAP,
  SHORT_ACCESS_TOKEN_TTL_IN_MS,
  MAX_NEW_ACCOUNT_AGE,
};

export default OauthConsts;
