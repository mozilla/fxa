/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import errors from '../../error';
import otplib from 'otplib';

export default (log, config, db) => {
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
     * @param code
     * @param secret
     * @param otpOptions
     * @returns number
     */
    verifyOtpCode(code, secret, otpOptions) {
      const authenticator = new otplib.authenticator.Authenticator();
      authenticator.options = Object.assign(
        {},
        otplib.authenticator.options,
        otpOptions,
        { secret }
      );
      return authenticator.check(code, secret);
    },
  };
};
