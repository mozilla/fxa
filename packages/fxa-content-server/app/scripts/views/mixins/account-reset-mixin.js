/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Handle reset accounts. Mixed into views.
 *
 * @class AccountResetMixin
 */

define(function (require, exports, module) {
  'use strict';

  var AuthErrors = require('lib/auth-errors');
  var BaseView = require('views/base');

  var t = BaseView.t;

  var AccountResetMixin = {
    initialize: function (options) {
      options = options || {};

      this._session = options.session;
    },

    events: {
      'click a[href="/confirm_reset_password"]':
          BaseView.preventDefaultThen('sendAccountResetEmail')
    },

    /**
     * Notify the user their account has been reset
     *
     * @param {Object} account - account that has been reset
     * @returns {String}
     */
    notifyOfResetAccount: function (account) {
      this._resetAccount = account;

      var err = AuthErrors.toError('ACCOUNT_RESET');

      err.forceMessage =
        t('Your account has been locked for security reasons') + '<br>' +
        '<a href="/confirm_reset_password">' + t('Reset password') + '</a>';

      return this.displayErrorUnsafe(err);
    },

    /**
     * Send the account reset email
     *
     * @returns {Promise} - resolves when complete
     */
    sendAccountResetEmail: function () {
      var self = this;
      var account = self._resetAccount;

      return self.resetPassword(account.get('email'))
        .fail(function (err) {
          self._session.clear('oauth');
          self.displayError(err);
        });
    }
  };

  module.exports = AccountResetMixin;
});

