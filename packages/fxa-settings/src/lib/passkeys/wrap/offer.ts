/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/browser';
import { ERRNO } from '@fxa/accounts/errors';
import type { RefObject } from 'react';
import type { SensitiveDataClient } from '../../sensitive-data-client';
import type {
  PasskeyAuthCompletion,
  PasskeySignInAuthClient,
} from '../signin-flow';

/**
 * False only when the server says no usable wrap is stored for this passkey:
 * none at all, or one that predates the account's key rotation and will be
 * replaced on store. Any other answer, including a lookup failure, counts as
 * stored so the opt-in is withheld.
 *
 * TODO(FXA-13152): interim. Passwordless sign-in fetches the wrap to open it
 * and reads errno 234 off that same call as the opt-in signal, so this
 * existence probe goes away.
 */
async function hasStoredWrap(
  authClient: Pick<PasskeySignInAuthClient, 'getPasskeyWrap'>,
  mfaToken: string,
  credentialId: string
): Promise<boolean> {
  try {
    await authClient.getPasskeyWrap(mfaToken, credentialId);
    return true;
  } catch (err) {
    const errno = (err as { errno?: number })?.errno;
    if (
      errno === ERRNO.PASSKEY_WRAP_NOT_FOUND ||
      errno === ERRNO.PASSKEY_WRAP_STALE
    ) {
      return false;
    }
    // Expected while the server flag lags the client's, or when the probe's
    // own rate limit trips; neither says anything is wrong.
    if (errno === ERRNO.FEATURE_NOT_ENABLED || errno === ERRNO.THROTTLED) {
      return true;
    }
    // Withholding the offer is the safe outcome, but an outage would
    // otherwise look identical to "already enrolled".
    Sentry.captureException(new Error('passkey-wrap-probe error'), {
      tags: { errno: String(errno ?? 'none') },
    });
    return true;
  }
}

/**
 * Holds the material the password-free opt-in page needs, in memory only.
 * The password step adds `kB`; the page clears the entry whatever the user
 * decides. An account that still has to create a password is not offered
 * the opt-in on the same sign-in, nor is a passkey that already has a wrap.
 * Nothing is held once the user has left the page.
 */
export async function stashPasskeyWrapOffer({
  authClient,
  completion,
  credentialId,
  prfOut,
  mounted,
  sensitiveDataClient,
}: {
  authClient: Pick<PasskeySignInAuthClient, 'getPasskeyWrap'>;
  completion: PasskeyAuthCompletion;
  credentialId: string;
  prfOut: Uint8Array | undefined;
  mounted: RefObject<boolean>;
  sensitiveDataClient: SensitiveDataClient;
}): Promise<void> {
  if (
    prfOut &&
    completion.mfaToken &&
    completion.hasPassword &&
    !(await hasStoredWrap(authClient, completion.mfaToken, credentialId)) &&
    mounted.current
  ) {
    sensitiveDataClient.PasskeyWrapData = {
      uid: completion.uid,
      credentialId,
      mfaToken: completion.mfaToken,
      prfOut,
    };
  }
}
