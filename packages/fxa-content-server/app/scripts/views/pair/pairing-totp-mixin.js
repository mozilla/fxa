/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthErrors from '../../lib/auth-errors';

export default function () {
  return {
    hasTotpEnabledOnAccount(profile) {
      return profile.authenticationMethods && profile.authenticationMethods.includes('otp');
    },
    checkTotpStatus() {
      const account = this.getSignedInAccount();

      if (! account) {
        this.replaceCurrentPage('pair/failure', {
          error: AuthErrors.toError('UNKNOWN_ACCOUNT'),
        });
      }

      return account.accountProfile().then((profile) => {
        // pairing is disabled for accounts with 2FA
        if (this.hasTotpEnabledOnAccount(profile)) {
          this.replaceCurrentPage('pair/failure', {
            error: AuthErrors.toError('TOTP_PAIRING_NOT_SUPPORTED'),
          });
        }
      });
    }
  };
}
