/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


/**
 * Provides reset password helper methods.
 *
 * Dependent on the ResumeTokenMixin which is automatically mixed-in.
 */

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var ResumeTokenMixin = require('views/mixins/resume-token-mixin');

  module.exports = _.extend({
    /**
     * Initiate a password reset. If successful, redirects to
     * `confirm_reset_password`.
     *
     * @param {email}
     * @return {promise} - resolves with auth server response if successful.
     */
    resetPassword: function (email) {
      var self = this;

      var account = this.user.initAccount({ email: email });
      return account.resetPassword(
        self.relier,
        {
          resume: self.getStringifiedResumeToken()
        }
      )
      .then(function (result) {
        self.navigate('confirm_reset_password', {
          clearQueryParams: true,
          data: {
            email: email,
            passwordForgotToken: result.passwordForgotToken
          }
        });

        return result;
      });
    },

    /**
     * Retry a password reset
     *
     * @param {string} email
     * @param {string} passwordForgotToken
     * @return {promise} - resolves with auth server response if successful.
     */
    retryResetPassword: function (email, passwordForgotToken) {
      var self = this;

      var account = this.user.initAccount({ email: email });
      return account.retryResetPassword(
        passwordForgotToken,
        self.relier,
        {
          resume: self.getStringifiedResumeToken()
        }
      );
    }
  }, ResumeTokenMixin);
});
