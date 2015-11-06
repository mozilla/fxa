/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Handle locked accounts. Mixed into views.
 *
 * @class AccountLockedMixin
 */

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var AuthErrors = require('lib/auth-errors');
  var BaseView = require('views/base');
  var ResumeTokenMixin = require('views/mixins/resume-token-mixin');

  var t = BaseView.t;

  var AccountLockedMixin = _.extend({
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
      self.logViewEvent('unlock-email.send');
      return self.fxaClient.sendAccountUnlockEmail(
        email,
        self.relier,
        {
          resume: this.getStringifiedResumeToken()
        }
      )
      .then(function () {
        self.logViewEvent('unlock-email.send.success');
        self.navigate('confirm_account_unlock', {
          data: {
            account: account,
            lockoutSource: self.getViewName()
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
    // Any view that uses the AccountLockedMixin has the ResumeTokenMixin
    // because the AccountLockedMixin depends on the ResumeTokenMixin.
  }, ResumeTokenMixin);

  module.exports = AccountLockedMixin;
});

