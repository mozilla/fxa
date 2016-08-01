/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Shared implementation of `signUp` view method

define(function (require, exports, module) {
  'use strict';

  module.exports = {

    /*anchor tag present in both signin and signup views*/
    events: {
      'click #suggest-sync a': 'onSuggestSyncClick'
    },

    isSyncSuggestionEnabled: function () {
      if (! this.relier.get('service')) {
        this.logViewEvent('sync-suggest.visible');
        return true;
      }
      return false;
    },

    /**
     * Sign up a user
     *
     * @param {object} account
     * @param {string} password
     * @return {object} promise
     */
    signUp: function (account, password) {
      var self = this;
      return self.invokeBrokerMethod('beforeSignIn', account.get('email'))
        .then(function () {
          return self.user.signUpAccount(account, password, self.relier, {
            resume: self.getStringifiedResumeToken()
          });
        })
        .then(function (account) {
          if (self._formPrefill) {
            self._formPrefill.clear();
          }

          var onSubmitComplete = self.onSignUpSuccess.bind(self);

          if (self.relier.accountNeedsPermissions(account)) {
            return self.navigate('signup_permissions', {
              account: account,
              // the permissions screen will call onSubmitComplete
              // with an updated account
              onSubmitComplete: onSubmitComplete
            });
          } else if (self.broker.hasCapability('chooseWhatToSyncWebV1')) {
            return self.navigate('choose_what_to_sync', {
              account: account,
              // choose_what_to_sync screen will call onSubmitComplete
              // with an updated account
              onSubmitComplete: onSubmitComplete
            });
          }

          return self.onSignUpSuccess(account);
        });
    },

    onSignUpSuccess: function (account) {
      this.logViewEvent('success');
      this.logViewEvent('signup.success');

      if (account.get('verified')) {
        // user was pre-verified.
        this.logViewEvent('preverified.success');
        return this.invokeBrokerMethod('afterSignIn', account)
          .then(() => {
            this.navigate('signup_complete');
          });
      }

      return this.invokeBrokerMethod('afterSignUp', account)
        .then(() => {
          this.navigate('confirm', {
            account: account,
            flow: this.flow
          });
        });
    },

    /**
     * interceptor function. Flushes metrics before redirecting
     * @param {object} event: click event
     */
    onSuggestSyncClick: function (event) {
      var self = this;
      event.preventDefault();

      this.logViewEvent('sync-suggest.clicked');

      this.metrics.flush()
        .then(function () {
          self.window.location = event.target.href;
        });
    }
  };
});
