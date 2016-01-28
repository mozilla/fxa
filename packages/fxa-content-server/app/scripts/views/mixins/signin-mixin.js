/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Shared implementation of `signIn` view method

define(function (require, exports, module) {
  'use strict';

  var AuthErrors = require('lib/auth-errors');
  var p = require('lib/promise');

  module.exports = {
    /**
     * Sign in a user
     *
     * @param {Account} account
     *     @param {String} account.sessionToken
     *     Session token from the account
     * @param {string} [password] - the user's password. Can be null if
     *  user is signing in with a sessionToken.
     * @return {object} promise
     */
    signIn: function (account, password) {
      if (! account ||
            account.isDefault() ||
            (! account.has('sessionToken') && ! password)) {
        return p.reject(AuthErrors.toError('UNEXPECTED_ERROR'));
      }

      var self = this;
      return self.invokeBrokerMethod('beforeSignIn', account.get('email'))
        .then(function () {
          return self.user.signInAccount(account, password, self.relier, {
            // a resume token is passed in to handle unverified users.
            resume: self.getStringifiedResumeToken()
          });
        })
        .then(function (account) {
          if (self._formPrefill) {
            self._formPrefill.clear();
          }

          if (self.relier.accountNeedsPermissions(account)) {
            return self.navigate('signin_permissions', {
              account: account,
              // the permissions screen will call onSubmitComplete
              // with an updated account
              onSubmitComplete: self.onSignInSuccess.bind(self)
            });
          }

          return self.onSignInSuccess(account);
        });
    },

    onSignInSuccess: function (account) {
      if (! account.get('verified')) {
        return this.navigate('confirm', {
          account: account
        });
      }

      this.logViewEvent('success');
      this.logViewEvent('signin.success');

      var brokerMethod = this.afterSignInBrokerMethod || 'afterSignIn';
      var navigateData = this.afterSignInNavigateData || {};


      return this.invokeBrokerMethod(brokerMethod, account)
        .then(this.navigate.bind(this, this.model.get('redirectTo') || 'settings', {}, navigateData));
    }
  };
});
