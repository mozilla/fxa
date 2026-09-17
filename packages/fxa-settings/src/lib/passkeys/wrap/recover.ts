/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { RefObject } from 'react';
import { uint8ToHex } from 'fxa-auth-client/lib/utils';
import type { SensitiveDataClient } from '../../sensitive-data-client';
import type { PasskeySignInAuthClient } from '../signin-flow';
import type { UnwrapPasskeyKbResult } from './consumption';

/**
 * Recovers `kB` from the passkey's stored wrap. Returns it as hex, or
 * undefined when the password step has to supply it instead. In that case a
 * passkey with no usable wrap yet leaves its opt-in material in
 * `sensitiveDataClient` for the page after the password step; that page
 * clears it whatever the user decides. Returns `'left'` when the user
 * navigated away mid-fetch: nothing may navigate or stash on their behalf.
 */
export async function recoverPasswordlessKb({
  authClient,
  mfaToken,
  uid,
  credentialId,
  prfOut,
  mounted,
  offerOptIn,
  sensitiveDataClient,
}: {
  authClient: Pick<PasskeySignInAuthClient, 'getPasskeyWrap'>;
  mfaToken: string;
  uid: string;
  credentialId: string;
  prfOut: Uint8Array | undefined;
  mounted: RefObject<boolean>;
  offerOptIn: boolean;
  sensitiveDataClient: SensitiveDataClient;
}): Promise<hexstring | undefined | 'left'> {
  // unwrapPasskeyKb zeroes what it is given; the opt-in needs its own copy.
  const prfForOptIn = prfOut && new Uint8Array(prfOut);
  let unwrapped: UnwrapPasskeyKbResult;
  try {
    // Loaded on demand: the wrap module pulls in the HPKE suite, which would
    // otherwise ship in the chunk every sign-in loads.
    const { unwrapPasskeyKb } = await import('./consumption');
    unwrapped = await unwrapPasskeyKb(authClient, {
      mfaToken,
      credentialId,
      prfOut,
    });
  } catch {
    // A rejected chunk load (e.g. offline) must fall back like any other
    // unwrap failure, not surface as the generic error banner.
    unwrapped = { ok: false, reason: 'fetch_failed' };
  }

  if (!mounted.current) {
    prfForOptIn?.fill(0);
    if (unwrapped.ok) {
      unwrapped.kB.fill(0);
    }
    return 'left';
  }

  if (unwrapped.ok) {
    prfForOptIn?.fill(0);
    const kB = uint8ToHex(unwrapped.kB);
    unwrapped.kB.fill(0);
    return kB;
  }

  // A passkey with nothing stored gets the offer, as does one whose wrap
  // predates the key rotation: the store replaces it.
  if (
    (unwrapped.reason === 'no_wrap' || unwrapped.reason === 'stale') &&
    prfForOptIn &&
    offerOptIn
  ) {
    sensitiveDataClient.PasskeyWrapData = {
      uid,
      credentialId,
      mfaToken,
      prfOut: prfForOptIn,
    };
  } else {
    prfForOptIn?.fill(0);
  }
  return undefined;
}
