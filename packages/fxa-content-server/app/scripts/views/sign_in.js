/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AccountResetMixin from './mixins/account-reset-mixin';
import AuthErrors from '../lib/auth-errors';
import AvatarMixin from './mixins/avatar-mixin';
import CachedCredentialsMixin from './mixins/cached-credentials-mixin';
import Cocktail from 'cocktail';
import EmailFirstExperimentMixin from './mixins/email-first-experiment-mixin';
import FlowBeginMixin from './mixins/flow-begin-mixin';
import FormPrefillMixin from './mixins/form-prefill-mixin';
import FormView from './form';
import PasswordMixin from './mixins/password-mixin';
import PasswordResetMixin from './mixins/password-reset-mixin';
import preventDefaultThen from './decorators/prevent_default_then';
import ServiceMixin from './mixins/service-mixin';
import Session from '../lib/session';
import SignedInNotificationMixin from './mixins/signed-in-notification-mixin';
import SignInMixin from './mixins/signin-mixin';
import SignInTemplate from 'templates/sign_in.mustache';
import UserCardMixin from './mixins/user-card-mixin';

const t = msg => msg;

const EMAIL_SELECTOR = 'input[type=email]';
const PASSWORD_SELECTOR = 'input[type=password]';

const View = FormView.extend({
  template: SignInTemplate,
  className: 'sign-in',

  initialize(options = {}) {
    // The number of stored accounts is logged to see if we can simplify
    // the User model. User grew a lot of complexity to support a user
    // being able to sign in using more than one email address, and we
    // want to see if this is being used in reality. If not, the model
    // can probably be vastly simplified. # of users is only logged from
    // the sign_in view because these are the users that are most likely
    // to have stored accounts, users that visit /signup probably not.
    this.user.logNumStoredAccounts();
  },

  beforeRender() {
    this._account = this.suggestedAccount();
  },

  getAccount() {
    return this._account;
  },

  getEmail() {
    return this.getAccount().get('email') || this.getPrefillEmail();
  },

  setInitialContext(context) {
    var suggestedAccount = this.getAccount();
    var hasSuggestedAccount = suggestedAccount.get('email');
    var email = this.getEmail();

    /// submit button
    const buttonSignInText = this.translate(t('Sign in'), {
      msgctxt: 'submit button',
    });

    /// header text
    const headerSignInText = this.translate(t('Sign in'), {
      msgctxt: 'header text',
    });

    context.set({
      buttonSignInText,
      chooserAskForPassword: this.isPasswordNeededForAccount(suggestedAccount),
      email: email,
      error: this.error,
      headerSignInText,
      password: this.formPrefill.get('password'),
      suggestedAccount: hasSuggestedAccount,
    });
  },

  events: {
    'click .use-different': 'useDifferentAccount',
  },

  submit() {
    let account = this.getAccount();

    if (this.$(PASSWORD_SELECTOR).length) {
      const email = this.getElementValue(EMAIL_SELECTOR);
      const password = this.getElementValue(PASSWORD_SELECTOR);

      // Re-authenticate the current account if we're signing in
      // with the same email address; otherwise start afresh.
      if (shouldCreateNewAccount(account, email)) {
        account = this.user.initAccount({
          email,
        });
      }
      return this._signIn(account, password);
    } else {
      return this.useLoggedInAccount(account);
    }

    function shouldCreateNewAccount(account, email) {
      return (
        !account ||
        !account.has('email') ||
        account.get('email').toLowerCase() !== email.toLowerCase()
      );
    }
  },

  /**
   * Sign in a user
   *
   * @param {Account} account
   *     @param {String} account.sessionToken
   *     Session token from the account
   * @param {String} [password] - the user's password. Can be null if
   *  user is signing in with a sessionToken.
   * @returns {Promise}
   * @private
   */
  _signIn(account, password) {
    return this.signIn(account, password).catch(
      this.onSignInError.bind(this, account, password)
    );
  },

  onSignInError(account, password, err) {
    if (AuthErrors.is(err, 'UNKNOWN_ACCOUNT')) {
      return this._suggestSignUp(err);
    } else if (AuthErrors.is(err, 'USER_CANCELED_LOGIN')) {
      this.logViewEvent('canceled');
      // if user canceled login, just stop
      return;
    } else if (AuthErrors.is(err, 'ACCOUNT_RESET')) {
      return this.notifyOfResetAccount(account);
    } else if (AuthErrors.is(err, 'INCORRECT_PASSWORD')) {
      return this.showValidationError(this.$('#password'), err);
    }

    // re-throw error, it will be handled at a lower level.
    throw err;
  },

  /**
   * Render to a basic sign in view, used with "Use a different account" button
   */
  useDifferentAccount: preventDefaultThen(function() {
    // TODO when the UI allows removal of individual accounts,
    // only clear the current account.
    this.user.removeAllAccounts();
    Session.clear();
    this.formPrefill.clear();
    this.logViewEvent('use-different-account');

    return this.render();
  }),

  _suggestSignUp(err) {
    err.forceMessage = t('Unknown account. <a href="/signup">Sign up</a>');

    return this.unsafeDisplayError(err);
  },
});

Cocktail.mixin(
  View,
  AccountResetMixin,
  AvatarMixin,
  CachedCredentialsMixin,
  FlowBeginMixin,
  EmailFirstExperimentMixin({ treatmentPathname: '/' }),
  FormPrefillMixin,
  PasswordMixin,
  PasswordResetMixin,
  ServiceMixin,
  SignInMixin,
  SignedInNotificationMixin,
  UserCardMixin
);

export default View;
