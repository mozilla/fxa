/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthErrors from '../../lib/auth-errors';

/**
 * View mixin to support a user upgrading their session to
 * be verified. If a form is submitted and returns with an
 * `unverified session` error, then the user will be redirected
 * to either verify the session with either a sign-in code
 * or a TOTP code.
 *
 */
export default {
  initialize() {
    this.skipBaseOnFormSubmit = true;
  },

  async onFormSubmit() {
    try {
      await this.validateAndSubmit();
    } catch (err) {
      if (AuthErrors.is(err, 'UNVERIFIED_SESSION')) {
        const account = this.getSignedInAccount();
        const profile = await account.accountProfile();

        // Check to see if the account has 2FA and redirect to that
        // page to verify
        if (
          profile.authenticationMethods &&
          profile.authenticationMethods.includes('otp')
        ) {
          return this.replaceCurrentPage('/signin_totp_code', {
            redirectPathname: this.window.location.pathname,
          });
        } else {
          // otw try to do a verification via an email code
          return account.verifySessionResendCode().then(() => {
            return this.replaceCurrentPage('/signin_token_code', {
              redirectPathname: this.window.location.pathname,
            });
          });
        }
      }
    }
  },
};
