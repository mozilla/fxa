/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Redirects back to RP with error code when errors are encountered in the
 * inline 2FA setup or prompt=none flows, unless the RP has disabled error
 * redirects, in which case the error is thrown. Mixed into views.
 *
 * @class ErrorRedirectMixin
 */

export default {
  redirectWithErrorCode(err) {
    if (this.relier.get('returnOnError') !== false) {
      return this.broker.sendOAuthResultToRelier({
        error: err.response_error_code || err.errno,
        redirect: this.relier.get('redirectUri'),
      });
    }
    throw err;
  },
};
