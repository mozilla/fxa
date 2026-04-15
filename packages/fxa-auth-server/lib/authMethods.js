/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { AppError: error } = require('@fxa/accounts/errors');

// This module serves two distinct purposes that should not be conflated:
//
// 1) RP reporting — availableAuthenticationMethods + maximumAssuranceLevel
//    compute the amr/acr values returned to relying parties via the
//    profile:amr scope. These reflect which mandatory second factors an
//    account has configured, so RPs can decide whether to prompt for
//    step-up authentication.
//
// 2) Session enforcement — accountRequiresAAL2 is used by the
//    session auth strategies (verified-session-token, mfa) to decide
//    whether to reject a session with insufficient AAL.
//
// The two paths intentionally use different functions. The semantics of
// RP-facing AMR/AAL are not well-defined and warrant a rethink — FXA-13432.
//
// Maps our variety of verification methods down to a few short standard
// "authentication method reference" strings that we're happy to expose to
// reliers. We try to use the values defined in RFC8176 where possible:
//
//   https://tools.ietf.org/html/rfc8176
//
// But invent our own where not (e.g. 'email').
const METHOD_TO_AMR = {
  email: 'email',
  'email-captcha': 'email',
  'email-2fa': 'email',
  'totp-2fa': 'otp',
  'recovery-code': 'otp',
  'sms-2fa': 'otp',
  passkey: 'webauthn',
};

// Maps AMR values to the type of authenticator they represent, e.g.
// "something you know" vs "something you have".  This helps us determine
// the level of assurance implied by a set of authentication methods.
const AMR_TO_TYPE = {
  pwd: 'know',
  email: 'know',
  otp: 'have',
  // WebAuthn with user verification is intrinsically multi-factor ('know'/'are'
  // + 'have'), so a passkey session should yield AAL2 on its own. Mapping only
  // to 'have' here means the AAL2 result for passkey sessions currently depends
  // on the 'pwd' entry always being present in the session AMR set — see the
  // comment in session_token.js authenticationMethods. Fixing this requires
  // maximumAssuranceLevel to support multi-type AMR entries — FXA-13432.
  webauthn: 'have',
};

module.exports = {
  /**
   * Returns the AMR values used to compute the authenticatorAssuranceLevel
   * returned to relying parties via the profile:amr scope. In practice this
   * reflects which *mandatory* second factors the account has enabled, not
   * every method the account could theoretically use.
   *
   * Passkeys are intentionally excluded: they are optional and do not raise
   * the required AAL for other sign-in paths. The semantics here are murky
   * and need a proper rethink — see FXA-13432.
   */
  async availableAuthenticationMethods(db, account) {
    const amrValues = new Set();
    // All accounts can authenticate with a password.
    amrValues.add('pwd');
    // All accounts can authenticate with an email confirmation loop.
    amrValues.add('email');
    // Some accounts have a TOTP token.
    let res;
    try {
      res = await db.totpToken(account.uid);
    } catch (err) {
      if (err.errno !== error.ERRNO.TOTP_TOKEN_NOT_FOUND) {
        throw err;
      }
    }
    if (res && res.verified && res.enabled) {
      amrValues.add('otp');
    }
    return amrValues;
  },

  /**
   * Map a verificiationMethod name to one of the publicly-exposed
   * amr value strings.  For example, "email-captcha" will map to
   * "email" while "totp-2fa" will map to "otp".
   */
  verificationMethodToAMR(verificationMethod) {
    const amr = METHOD_TO_AMR[verificationMethod];
    if (!amr) {
      throw new Error(`unknown verificationMethod: ${verificationMethod}`);
    }
    return amr;
  },

  /**
   * Given a set of AMR value strings, return the AAL implied by the
   * distinct authenticator types present (NIST SP 800-63B levels 1–2;
   * level 3 is not supported). Two distinct types (e.g. 'know' + 'have')
   * yields AAL2; one type yields AAL1.
   *
   * This function has two call sites with different inputs and different
   * semantics:
   *
   * - SessionToken.authenticatorAssuranceLevel passes the session's own AMR
   *   set, producing the AAL of the current session. This value flows into
   *   the fxa-aal JWT claim and is checked against RP acr_values requests.
   *
   * - The profile:amr response path passes the output of
   *   availableAuthenticationMethods, which reflects mandatory second factors
   *   only and intentionally excludes passkeys. An account with passkeys
   *   registered but no TOTP will receive AAL1 here even though AAL2 is
   *   achievable — see FXA-13432.
   */
  maximumAssuranceLevel(amrValues) {
    const types = new Set();
    amrValues.forEach((amr) => {
      const type = AMR_TO_TYPE[amr];
      if (type) types.add(type);
    });
    return types.size;
  },

  /**
   * Returns true if the account requires AAL2 on ALL sign-in paths.
   *
   * Only TOTP makes 2FA mandatory — if enabled, every session must reach AAL2.
   * Passkeys are optional: registering one does not force AAL2 on password
   * sign-ins.
   */
  async accountRequiresAAL2(db, account) {
    let res;
    try {
      res = await db.totpToken(account.uid);
    } catch (err) {
      if (err.errno !== error.ERRNO.TOTP_TOKEN_NOT_FOUND) {
        throw err;
      }
    }
    return !!(res && res.verified && res.enabled);
  },
};
