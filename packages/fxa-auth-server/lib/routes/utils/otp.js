/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const errors = require('../../error');
const otplib = require('otplib');

module.exports = (log, config, db, statsd) => {
  return {
    /**
     * Helper function to check if the specified account has a verified
     * and enabled TOTP token.
     *
     * @param account
     * @returns boolean
     */
    async hasTotpToken(account) {
      const { uid } = account;
      let result;
      try {
        result = await db.totpToken(uid);
      } catch (err) {
        if (err.errno === errors.ERRNO.TOTP_TOKEN_NOT_FOUND) {
          return false;
        }
        throw err;
      }
      return !!(result && result.verified && result.enabled);
    },

    /**
     * Helper function to simplify generating otp codes.
     *
     * @param secret
     * @param otpOptions
     * @returns number
     */
    generateOtpCode(secret, otpOptions) {
      const authenticator = new otplib.authenticator.Authenticator();
      authenticator.options = Object.assign(
        {},
        otplib.authenticator.options,
        otpOptions,
        { secret }
      );
      return authenticator.generate(secret);
    },

    /**
     * Helper function to simplify verifying otp codes.
     *
     * @param code the totp code
     * @param secret the secret used to verify code
     * @param otpOptions additional options
     * @param type the type of totp code being verified
     * @returns {{valid: boolean, delta: number}} object with valid status and delta
     */
    verifyOtpCode(code, secret, otpOptions, type) {
      const authenticator = new otplib.authenticator.Authenticator();
      authenticator.options = Object.assign(
        {},
        otplib.authenticator.options,
        otpOptions,
        { secret }
      );
      const valid = authenticator.check(code, secret);
      const delta = authenticator.checkDelta(code, secret);

      if (type) {
        statsd.histogram(`${type}.totp.delta_histogram`, delta);
      }
      // Return delta for logging
      return { valid, delta };
    },
  };
};
