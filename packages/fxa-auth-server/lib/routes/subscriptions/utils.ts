/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { OAUTH_SCOPE_SUBSCRIPTIONS } from 'fxa-shared/oauth/constants';
import ScopeSet from 'fxa-shared/oauth/scopes';
import { Logger } from 'mozlog';

import error from '../../error';
import { AuthRequest, TaxAddress } from '../../types';

/**
 * Authentication handler for subscription routes.
 */
export async function handleAuth(
  db: any,
  auth: AuthRequest['auth'],
  fetchEmail = false
) {
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
  return { uid, email, account } as {
    uid: string;
    email: string;
    account: any;
  };
}

export function handleUidAuth(auth: AuthRequest['auth']): string {
  const scope = ScopeSet.fromArray(auth.credentials.scope);
  if (!scope.contains(OAUTH_SCOPE_SUBSCRIPTIONS)) {
    throw error.invalidScopes();
  }
  return auth.credentials.user as string;
}

export function handleAuthScoped(auth: AuthRequest['auth'], scopes: string[]) {
  const scope = ScopeSet.fromArray(auth.credentials.scope);
  for (const requiredScope of scopes) {
    if (!scope.contains(requiredScope)) {
      throw error.invalidScopes();
    }
  }
  const { user: uid, email } = auth.credentials;
  return { uid, email } as { uid: string; email: string };
}

/**
 * Builds a TaxAddress from request geolocation or customer
 * A tax address is only considered complete if it has both countryCode and postalCode
 * @param ipAddress Used for logging purposes
 * @param location Used to determine tax location if customer does not have/not provided
 * @param customer Used to determine tax location first if shipping address present
 */
export function buildTaxAddress(
  log: Logger,
  ipAddress: string,
  location?: {
    countryCode?: string;
    postalCode?: string;
  }
): TaxAddress | undefined {
  if (location?.countryCode && location?.postalCode) {
    return {
      countryCode: location.countryCode,
      postalCode: location.postalCode,
    };
  }

  log.warn('buildTaxAddress', {
    ipAddress,
    location,
  });

  return;
}
