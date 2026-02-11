/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Handle reset accounts. Mixed into views.
 *
 * @class AccountResetMixin
 */

import AuthErrors from '../../lib/auth-errors';
import preventDefaultThen from '../decorators/prevent_default_then';

const t = (msg) => msg;

var AccountResetMixin = {
  initialize(options) {
    options = options || {};

    this._session = options.session;
  },

  events: {
    'click a[href="/confirm_reset_password"]': preventDefaultThen(
      'sendAccountResetEmail'
    ),
  },

  /**
   * Notify the user their account has been reset
   *
   * @param {Object} account - account that has been reset
   * @returns {String}
   */
  notifyOfResetAccount(account) {
    this._resetAccount = account;

    var err = AuthErrors.toError('ACCOUNT_RESET');

    err.forceMessage =
      t('Your account has been locked for security reasons') +
      '<br>' +
      '<a href="/confirm_reset_password">' +
      t('Reset password') +
      '</a>';

    return this.unsafeDisplayError(err);
  },

  /**
   * Send the account reset email
   *
   * @returns {Promise} - resolves when complete
   */
  sendAccountResetEmail() {
    const account = this._resetAccount;
    return account
      .resetPassword(this.relier)
      .then(() => {
        this.hideError();
      })
      .catch((err) => {
        this._session.clear('oauth');
        this.displayError(err);
      });
  },
};

export default AccountResetMixin;
