/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthErrors from '../../lib/auth-errors';
import FormPrefillMixin from './form-prefill-mixin';
import SigninMixin from './signin-mixin';

export default {
  dependsOn: [FormPrefillMixin, SigninMixin],

  /**
   * Get the prefill email.
   *
   * @returns {String}
   */
  getPrefillEmail() {
    // formPrefill.email comes first because users can edit the email,
    // go to another view, edit the email again, and come back here. We
    // want the last used email.
    return (
      this.formPrefill.get('email') ||
      this.relier.get('email') ||
      ''
    ).trim();
  },

  /**
   * Determine if the user must be asked for a password to use `account`
   *
   * @param {Account} account
   * @returns {Boolean}
   */
  isPasswordNeededForAccount(account) {
    // If the account doesn't yet have an email address, we'll need a password too.
    if (!account.get('email')) {
      return true;
    }

    // If the relier wants keys, then the user must authenticate and the password must be requested.
    // This includes sync, which must skip the login chooser at all cost
    if (this.relier.wantsKeys()) {
      return true;
    }

    // We need to ask the user again for their password unless the credentials came from Sync.
    // Otherwise they aren't able to "fully" log out. Only Sync has a clear path to disconnect/log out
    // your account that invalidates your sessionToken.
    if (!this.user.isSyncAccount(account)) {
      return true;
    }

    // Ask when 'chooserAskForPassword' is explicitly set.
    // This happens in response to an expired session token.
    if (this.model.get('chooserAskForPassword') === true) {
      return true;
    }

    // Ask when a prefill email does not match the account email.
    const prefillEmail = this.getPrefillEmail();
    if (prefillEmail && prefillEmail !== account.get('email')) {
      return true;
    }

    // If none of that is true, it's safe to proceed without asking for the password.
    return false;
  },

  /**
   * Sign in `account` without a password, used
   * when `account` already has a session that can
   * be used to sign in again.
   *
   * @param {Object} account - logged in account
   * @returns {Promise}
   */
  useLoggedInAccount(account) {
    return this.signIn(account, null).catch(() => {
      this.user.removeAccount(account);
      this.formPrefill.set(account.pick('email'));
      this.model.set('chooserAskForPassword', true);
      return this.render().then(() => {
        return this.displayError(AuthErrors.toError('SESSION_EXPIRED'));
      });
    });
  },

  /**
   * Get the "suggested" account
   *
   * @returns {Object} the suggested Account
   */
  suggestedAccount() {
    const user = this.user;
    const account = user.getChooserAccount();
    if (this.allowSuggestedAccount(account)) {
      return account;
    } else {
      return user.initAccount({});
    }
  },

  /**
   * Is the suggested account allowed?
   *
   * @param {Object} suggestedAccount
   * @returns {Boolean}
   */
  allowSuggestedAccount(suggestedAccount) {
    const suggestedEmail = suggestedAccount.get('email') || '';
    const trimmedEmail = suggestedEmail.trim();
    if (!trimmedEmail) {
      return false;
    }

    const prefillEmail = this.getPrefillEmail();
    if (!prefillEmail) {
      return true;
    }

    return prefillEmail === trimmedEmail;
  },
};
