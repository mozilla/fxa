/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthClient from 'fxa-auth-client/browser';
import AuthenticationMethods from '../../constants/authentication-methods';

/**
 * How long a verified code is treated as good for approving a pairing. The
 * approval screen stays up for as long as the pairing channel does, so a code
 * entered and then left alone is asked for again rather than trusted.
 */
export const PAIRING_SECOND_FACTOR_REPROMPT_MS = 4 * 60 * 1000;

/** True when a code verified at `verifiedAt` should be re-entered before approving. */
export function isSecondFactorStale(
  verifiedAt: number,
  now: number = Date.now()
): boolean {
  return now - verifiedAt > PAIRING_SECOND_FACTOR_REPROMPT_MS;
}

/**
 * Whether the authority must enter a fresh TOTP code before approving a
 * pairing. `otp` appears in the profile's authentication methods only when
 * TOTP is both set up and verified on the account.
 *
 * A failed profile lookup counts as "not required": the session was already
 * verified at sign-in, and a transient auth-server error must not strand the
 * user on a spinner.
 */
export async function pairingRequiresTotp(
  authClient: Pick<AuthClient, 'accountProfile'>,
  sessionToken: string
): Promise<boolean> {
  try {
    const { authenticationMethods } =
      await authClient.accountProfile(sessionToken);
    return (
      Array.isArray(authenticationMethods) &&
      authenticationMethods.includes(AuthenticationMethods.OTP)
    );
  } catch {
    return false;
  }
}
