/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const errors = require('../../error');

module.exports = (log, config, db) => {
  return {
    /**
     * Helper function to check if the specified account has a verified
     * and enabled TOTP token.
     *
     * @param account
     * @returns boolean
     */
    hasTotpToken(account) {
      const { uid } = account;
      return db.totpToken(uid).then(
        result => {
          if (result && result.verified && result.enabled) {
            return true;
          }
        },
        err => {
          if (err.errno === errors.ERRNO.TOTP_TOKEN_NOT_FOUND) {
            return false;
          }
          throw err;
        }
      );
    },
  };
};
