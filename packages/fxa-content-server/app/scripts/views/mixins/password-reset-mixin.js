/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Provides reset password helper methods.
 *
 * Dependent on the ResumeTokenMixin which is automatically mixed-in.
 */

import ResumeTokenMixin from './resume-token-mixin';

export default {
  dependsOn: [ResumeTokenMixin],

  /**
   * Initiate a password reset. If successful, redirects to
   * `confirm_reset_password`.
   *
   * @param {String} email
   * @return {Promise} - resolves with auth server response if successful.
   */
  resetPassword(email) {
    var account = this.user.initAccount({ email: email });
    return account
      .resetPassword(this.relier, {
        resume: this.getStringifiedResumeToken(account),
      })
      .then(result => {
        this.navigate(
          'confirm_reset_password',
          {
            email: email,
            passwordForgotToken: result.passwordForgotToken,
          },
          {
            clearQueryParams: true,
          }
        );

        return result;
      });
  },

  /**
   * Retry a password reset
   *
   * @param {String} email
   * @param {String} passwordForgotToken
   * @return {Promise} - resolves with auth server response if successful.
   */
  retryResetPassword(email, passwordForgotToken) {
    var account = this.user.initAccount({ email: email });
    return account.retryResetPassword(passwordForgotToken, this.relier, {
      resume: this.getStringifiedResumeToken(account),
    });
  },
};
