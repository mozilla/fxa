/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Handle locked accounts. Mixed into views.
 *
 * @class AccountLockedMixin
 */
'use strict';

define([
  'views/base',
  'lib/auth-errors'
], function (BaseView, AuthErrors) {
  var t = BaseView.t;

  var AccountLockedMixin = {
    events: {
      'click a[href="/confirm_account_unlock"]':
            BaseView.preventDefaultThen('sendAccountLockedEmail')
    },

    notifyOfLockedAccount: function (account) {
      this._lockedAccount = account;

      var err = AuthErrors.toError('ACCOUNT_LOCKED');
      err.forceMessage = t('Account locked. <a href="/confirm_account_unlock">Send unlock email</a>');

      return this.displayErrorUnsafe(err);
    },

    sendAccountLockedEmail: function () {
      var self = this;
      var account = self._lockedAccount;
      var email = account.get('email');
      self.logScreenEvent('unlock-email.send');
      return self.fxaClient.sendAccountUnlockEmail(email, self.relier)
        .then(function () {
          self.logScreenEvent('unlock-email.send.success');
          self.navigate('confirm_account_unlock', {
            data: {
              lockoutSource: self.getScreenName(),
              account: account
            }
          });
        }, function (err) {
          if (AuthErrors.is(err, 'UNKNOWN_ACCOUNT')) {
            return self.navigate('signup', {
              error: err
            });
          }

          self.displayError(err);
        });
    }
  };

  return AccountLockedMixin;
});

