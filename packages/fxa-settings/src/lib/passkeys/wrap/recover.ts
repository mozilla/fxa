/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { RefObject } from 'react';
import { uint8ToHex } from 'fxa-auth-client/lib/utils';
import type { SensitiveDataClient } from '../../sensitive-data-client';
import type AuthClient from 'fxa-auth-client/browser';
import { uidFromMfaToken } from '../../mfa-guard-utils';
import type { UnwrapPasskeyKbResult } from './consumption';

export type RecoverPasswordlessKbResult =
  /** `kB` is in hand; the sign-in can finish without a password. */
  | { outcome: 'recovered'; kB: hexstring }
  /** The password step has to supply `kB`. */
  | { outcome: 'needs_password' }
  /** The user navigated away mid-fetch; nothing may act on their behalf. */
  | { outcome: 'left' };

/**
 * Recovers `kB` from the passkey's stored wrap. When the password step has to
 * supply it instead, a passkey with no usable wrap yet leaves its opt-in
 * material in `sensitiveDataClient` for the page after that step, which clears
 * it whatever the user decides.
 */
export async function recoverPasswordlessKb({
  authClient,
  uid,
  mfaToken,
  credentialId,
  prfOut,
  mounted,
  offerOptIn,
  sensitiveDataClient,
}: {
  authClient: Pick<AuthClient, 'getPasskeyWrap'>;
  /** The account the sign-in session belongs to. */
  uid: string;
  mfaToken: string;
  credentialId: string;
  prfOut: Uint8Array | undefined;
  mounted: RefObject<boolean>;
  offerOptIn: boolean;
  sensitiveDataClient: SensitiveDataClient;
}): Promise<RecoverPasswordlessKbResult> {
  // The proof must name the session's account: the wrap is opened with that
  // uid, and the kB it yields goes into this session's OAuth flow.
  if (uidFromMfaToken(mfaToken) !== uid) {
    return { outcome: 'needs_password' };
  }
  let unwrapped: UnwrapPasskeyKbResult;
  try {
    // Loaded on demand: the wrap module pulls in the HPKE suite, which would
    // otherwise ship in the chunk every sign-in loads.
    const { unwrapPasskeyKb } = await import('./consumption');
    unwrapped = await unwrapPasskeyKb(authClient, {
      mfaToken,
      uid,
      credentialId,
      prfOut,
    });
  } catch {
    // A rejected chunk load (e.g. offline) must fall back like any other
    // unwrap failure, not surface as the generic error banner.
    unwrapped = { ok: false, reason: 'failed' };
  }

  if (!mounted.current) {
    if (unwrapped.ok) {
      unwrapped.kB.fill(0);
    }
    return { outcome: 'left' };
  }

  if (unwrapped.ok) {
    try {
      // A hex copy that cannot be zeroed, matching what the password path
      // already hands to the OAuth flow.
      return { outcome: 'recovered', kB: uint8ToHex(unwrapped.kB) };
    } finally {
      unwrapped.kB.fill(0);
    }
  }

  // A passkey with nothing stored gets the offer, as does one whose wrap
  // predates the key rotation: the store replaces it.
  if (
    (unwrapped.reason === 'no_wrap' || unwrapped.reason === 'stale') &&
    prfOut &&
    offerOptIn
  ) {
    // Zeroes whatever it replaces rather than dropping the reference.
    sensitiveDataClient.clearPasskeyWrapData();
    sensitiveDataClient.PasskeyWrapData = {
      uid,
      credentialId,
      mfaToken,
      // A copy: the caller zeroes its own once the ceremony ends.
      prfOut: new Uint8Array(prfOut),
    };
  }
  return { outcome: 'needs_password' };
}
