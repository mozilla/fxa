/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthErrors from '../../lib/auth-errors';
import FormPrefillMixin from './form-prefill-mixin';
import SigninMixin from './signin-mixin';

export default {
  dependsOn: [FormPrefillMixin, SigninMixin],

  initialize(options) {
    // Both this.displayAccountProfileImage and signing in with cached
    // credentials could cause the existing sessionToken
    // to be invalidated. When this happens, re-render the view.
    const account = this.getAccount();
    this.listenTo(account, 'change:sessionToken', () => {
      if (!account.get('sessionToken')) {
        return this.rerender();
      }
    });
  },

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
    // If the account doesn't have a sessionToken, we'll need a password
    if (!account.get('sessionToken')) {
      return true;
    }

    // If the account doesn't yet have an email address, we'll need a password too.
    if (!account.get('email')) {
      return true;
    }

    // If the relier wants keys, then the user must authenticate and the password must be requested.
    // This includes sync, which must skip the login chooser at all cost
    if (this.relier.wantsKeys()) {
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
    // set the formPrefill email in case the signin fails
    // the email will be prefilled on the legacy signin page.
    // If the signin fails
    this.formPrefill.set(account.pick('email'));
    return this.signIn(account, null, {
      // When using a cached credential, the auth-server routes do not get hit,
      // This event will cause the content-server to emit the complete event.
      onSuccess: () => this.logEvent('cached.signin.success'),
    }).catch(err => {
      // Session was invalid. Set a SESSION EXPIRED error on the model
      // causing an error to be displayed when the view re-renders
      // due to the sessionToken update.
      if (AuthErrors.is(err, 'INVALID_TOKEN')) {
        this.model.set('error', AuthErrors.toError('SESSION_EXPIRED'));
      } else {
        throw err;
      }
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
