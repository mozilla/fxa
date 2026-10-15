/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthClient from 'fxa-auth-client/browser';
import AuthenticationMethods from '../../constants/authentication-methods';

/**
 * Whether the authority must enter a TOTP code before approving a pairing.
 * `otp` appears in the profile's authentication methods only when TOTP is
 * both set up and verified on the account. A code this browser verified
 * within `maxAgeMs`, at sign-in or on an earlier prompt, is not asked again.
 * Pairing hands the account's Sync keys to a new device, so a signed-in
 * browser left unattended should not be enough. See `pairing.totp_max_age_minutes`.
 *
 * A failed profile lookup counts as "not required": the session was already
 * verified at sign-in, and a transient auth-server error must not strand the
 * user on a spinner.
 */
export async function pairingRequiresTotp(
  authClient: Pick<AuthClient, 'accountProfile'>,
  sessionToken: string,
  recentCode: { verifiedAt?: number; maxAgeMs: number },
  now: number = Date.now()
): Promise<boolean> {
  if (
    recentCode.verifiedAt !== undefined &&
    now - recentCode.verifiedAt <= recentCode.maxAgeMs
  ) {
    return false;
  }
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
