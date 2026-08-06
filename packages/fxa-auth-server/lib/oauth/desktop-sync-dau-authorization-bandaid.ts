/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Bandaid (FXA-14263). Firefox Desktop requests the Sync scope on every
// browser-initiated flow (`FxAccountsConfig.sys.mjs::_getAuthParams`), whatever
// service the user is signing into. So a Smart Window, Relay or VPN sign-in
// writes an apps/oldsync consent row and mints an apps/oldsync access token for
// a user who never authorized Sync, inflating both Sync authorizations and
// Sync DAU (FXA-13364).
//
// Entering a password is deliberately not Sync consent, per Product: a
// keys_jwe flow on a non-Sync service gets Sync keys so the user can enable
// Sync later, but they saw nothing about Sync. Only `service=sync`, or a
// missing service (very old browsers, which default to Sync), counts.
//
// One decision, two consumers: it keeps the row out of accountAuthorizations,
// and — carried to /oauth/token on the auth code, which never sees `service=` —
// tags the access_token.created Glean event `exclude_dau`. The scope is still
// granted and the token still carries it, so Sync keeps working.
//
// Delete this module once Desktop drops `scope=` in favour of ADR 0049
// resolution. Recording real consent when the user enables Sync in the browser
// is FXA-14295. See also `vpn-in-desktop-dau-bandaid.ts`, the token-endpoint
// counterpart, which has its own separate deletion trigger.
//
// Desktop-only: Fenix sends `profile + oldsync + vpn` with `service=vpn`, but
// while Sync is not decoupled on Android that genuinely is a Sync signup.

import { OAuthNativeClients, OAuthNativeServices } from '@fxa/accounts/oauth';
import { OAUTH_SCOPE_OLD_SYNC } from 'fxa-shared/oauth/constants';

/**
 * Redis key for the pending exclude-DAU decision, keyed on the code's hash
 * (never the code itself, which is a credential). Written at
 * /oauth/authorization, read when the code is redeemed, expires with the code.
 */
export function excludeDauCacheKey(codeIdHex: string): string {
  return `syncDauExclude:${codeIdHex}`;
}

export interface DropUnconsentedSyncScopeParams {
  /** Scopes about to be written to `accountAuthorizations`. */
  scopes: string[];
  /** Resolved browser service; '' when absent, unknown, or ambiguous. */
  serviceValue: string;
  /** Hex OAuth client id for this authorization. */
  clientIdHex: string;
}

export interface DropUnconsentedSyncScopeResult {
  /** The scopes to record consent for. */
  scopes: string[];
  /** True when the Sync scope was removed. */
  droppedSyncScope: boolean;
}

/**
 * Returns the scopes to record consent for, with the Sync scope removed when
 * Firefox Desktop resolved a browser service other than Sync. Everything else
 * passes through untouched.
 *
 * Both inputs are matched case-insensitively rather than trusting callers to
 * normalize. They are lowercase today, but `serviceValue` can come from an
 * env-overridable config key, and an uppercase one would silently drop a
 * genuine Sync consent.
 */
export function dropUnconsentedSyncScope({
  scopes,
  serviceValue,
  clientIdHex,
}: DropUnconsentedSyncScopeParams): DropUnconsentedSyncScopeResult {
  if ((clientIdHex || '').toLowerCase() !== OAuthNativeClients.FirefoxDesktop) {
    return { scopes, droppedSyncScope: false };
  }
  // An absent service conventionally means Sync (see `isDefaultSyncService` in
  // fxa-settings), so only drop when another service was positively resolved.
  const service = (serviceValue || '').toLowerCase();
  if (!service || service === OAuthNativeServices.Sync) {
    return { scopes, droppedSyncScope: false };
  }
  // Exact match on the scope URL; sub-scopes like .../oldsync/bookmarks are left.
  const kept = scopes.filter((scope) => scope !== OAUTH_SCOPE_OLD_SYNC);
  return { scopes: kept, droppedSyncScope: kept.length !== scopes.length };
}
