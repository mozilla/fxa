/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const error = require('./error');

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
};

// Maps AMR values to the type of authenticator they represent, e.g.
// "something you know" vs "something you have".  This helps us determine
// the level of assurance implied by a set of authentication methods.
const AMR_TO_TYPE = {
  pwd: 'know',
  email: 'know',
  otp: 'have',
};

module.exports = {
  /**
   * Returns the set of authentication methods available
   * for the given account, as amr value strings.
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
   * Given a set of AMR value strings, return the maximum authenticator assurance
   * level that can be achieved using them.  We aim to follow the definition
   * of levels 1, 2, and 3 from NIST SP 800-63B based on different categories
   * of authenticator (e.g. "something you know" vs "something you have"),
   * although we don't yet support any methods that would qualify the user
   * for level 3.
   */
  maximumAssuranceLevel(amrValues) {
    const types = new Set();
    amrValues.forEach(amr => {
      types.add(AMR_TO_TYPE[amr]);
    });
    return types.size;
  },
};
