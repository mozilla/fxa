/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ScopeSet from 'fxa-shared/oauth/scopes';
import { OAUTH_SCOPE_SUBSCRIPTIONS } from 'fxa-shared/oauth/constants';
import error from '../../error';

/**
 * Authentication handler for subscription routes.
 */
export async function handleAuth(db: any, auth: any, fetchEmail = false) {
  const scope = ScopeSet.fromArray(auth.credentials.scope);
  if (!scope.contains(OAUTH_SCOPE_SUBSCRIPTIONS)) {
    throw error.invalidScopes();
  }
  const { user: uid } = auth.credentials;
  let email;
  let account;
  if (!fetchEmail) {
    ({ email } = auth.credentials);
  } else {
    account = await db.account(uid);
    ({ email } = account.primaryEmail);
  }
  return { uid, email, account };
}

export function handleUidAuth(auth: any): string {
  const scope = ScopeSet.fromArray(auth.credentials.scope);
  if (!scope.contains(OAUTH_SCOPE_SUBSCRIPTIONS)) {
    throw error.invalidScopes();
  }
  return auth.credentials.user;
}

export type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;
