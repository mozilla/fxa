/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export function isClientAllowedForPasswordless(
  allowedClientIds: string[],
  clientId?: string
): boolean {
  return !!clientId && allowedClientIds?.includes(clientId);
}

/**
 * Existing passwordless accounts (verifierSetAt === 0 and no linked accounts)
 * are always eligible, regardless of the feature flag. The flag only gates new
 * signups. Third-party auth accounts also have verifierSetAt === 0 but should
 * use their linked provider, not passwordless OTP.
 */
export function isPasswordlessEligible(
  account: { verifierSetAt: number; linkedAccounts?: unknown[] } | null,
  email: string,
  featureEnabled: boolean
): boolean {
  // Existing passwordless accounts are always eligible, but not third-party
  // auth accounts which also have verifierSetAt === 0
  if (account?.verifierSetAt === 0 && !(account.linkedAccounts?.length)) {
    return true;
  }
  // Flag gates new signups and is required for non-passwordless accounts
  if (!featureEnabled) {
    return false;
  }
  // New account (doesn't exist yet) — eligible; existing with password — not
  return !account;
}
