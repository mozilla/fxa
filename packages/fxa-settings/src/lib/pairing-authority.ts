/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Shared state for the authority side of device pairing — the already
 * signed-in Firefox that approves a new device.
 */

import { firefox, SignedInUser } from './channels/firefox';
import { Constants } from './constants';

/**
 * The account the browser will pair, sourced from the `fxa_status` WebChannel
 * handshake.
 *
 * Web localStorage is deliberately not consulted. The browser owns the session
 * that `fxaccounts:pair_authorize` acts on, so it is the only trustworthy
 * identity here: reading localStorage let an attacker weaken the TOTP gate
 * either by clearing site data (no cached account, check skipped) or by
 * signing a different account into the web app (FXA-14194). Backbone sourced
 * the same account from the browser — see `shouldSetSignedInAccountFromBrowser`
 * in content-server's `models/user.js`.
 *
 * Resolves to undefined when the browser has no signed-in account or does not
 * answer. Callers must treat that as "cannot pair" rather than proceeding.
 */
export async function getPairingAuthorityAccount(): Promise<
  SignedInUser | undefined
> {
  try {
    const signedInUser = await firefox.requestSignedInUser(
      Constants.OAUTH_CONTEXT,
      true,
      Constants.SYNC_SERVICE
    );
    return signedInUser?.sessionToken ? signedInUser : undefined;
  } catch {
    return undefined;
  }
}

/**
 * channel_id of the pairing that most recently passed the TOTP prompt, or null
 * when no code has been accepted.
 */
let totpVerifiedChannelId: string | null = null;

/**
 * Record that the authority entered a valid TOTP code for this pairing.
 *
 * Kept in memory and keyed by channel, so a reload, a new tab, or a second
 * pairing attempt all require a fresh code. This replaces the router state
 * flag the approval page used to trust, which survived history navigation and
 * could be set without ever passing the prompt (FXA-14194).
 */
export function markPairingTotpVerified(channelId: string): void {
  totpVerifiedChannelId = channelId;
}

export function isPairingTotpVerified(channelId: string): boolean {
  return totpVerifiedChannelId !== null && totpVerifiedChannelId === channelId;
}

/** Test helper — drops the in-memory verification. */
export function resetPairingTotpVerified(): void {
  totpVerifiedChannelId = null;
}

/**
 * The pairing channel_id. Authority pages receive it as a query param; the
 * hash is supplicant-only.
 */
export function getPairingChannelId(): string {
  return new URLSearchParams(window.location.search).get('channel_id') || '';
}
