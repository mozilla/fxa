/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const AccountResetMixin = require('./mixins/account-reset-mixin');
  const allowOnlyOneSubmit = require('./decorators/allow_only_one_submit');
  const AuthErrors = require('../lib/auth-errors');
  const AvatarMixin = require('./mixins/avatar-mixin');
  const Cocktail = require('cocktail');
  const EmailFirstExperimentMixin = require('./mixins/email-first-experiment-mixin');
  const FlowBeginMixin = require('./mixins/flow-begin-mixin');
  const FormPrefillMixin = require('./mixins/form-prefill-mixin');
  const FormView = require('./form');
  const MigrationMixin = require('./mixins/migration-mixin');
  const PasswordMixin = require('./mixins/password-mixin');
  const PasswordResetMixin = require('./mixins/password-reset-mixin');
  const { preventDefaultThen, t } = require('./base');
  const ServiceMixin = require('./mixins/service-mixin');
  const Session = require('../lib/session');
  const showProgressIndicator = require('./decorators/progress_indicator');
  const SignedInNotificationMixin = require('./mixins/signed-in-notification-mixin');
  const SignInMixin = require('./mixins/signin-mixin');
  const SignInTemplate = require('stache!templates/sign_in');

  const proto = FormView.prototype;
  const View = FormView.extend({
    template: SignInTemplate,
    className: 'sign-in',

    initialize (options = {}) {
      // The number of stored accounts is logged to see if we can simplify
      // the User model. User grew a lot of complexity to support a user
      // being able to sign in using more than one email address, and we
      // want to see if this is being used in reality. If not, the model
      // can probably be vastly simplified. # of users is only logged from
      // the sign_in view because these are the users that are most likely
      // to have stored accounts, users that visit /signup probably not.
      this.user.logNumStoredAccounts();
    },

    beforeRender () {
      this._account = this._suggestedAccount();
    },

    afterVisible () {
      proto.afterVisible.call(this);
      // this.displayAccountProfileImage could cause the existing
      // accessToken to be invalidated, in which case the view
      // should be re-rendered with the default avatar.
      const account = this.getAccount();
      this.listenTo(account, 'change:accessToken', () => {
        // if no access token and password is not visible we need to show the password field.
        if (! account.has('accessToken') && this.$('.password').is(':hidden')) {
          // accessToken could be changed async by an external request after render
          // If the ProfileClient fails to get an OAuth token with the current token then reset the view
          this.chooserAskForPassword = true;
          return this.render().then(() => this.setDefaultPlaceholderAvatar());
        }
      });

      return this.displayAccountProfileImage(account, { spinner: true });
    },

    getAccount () {
      return this._account;
    },

    getPrefillEmail () {
      // formPrefill.email comes first because users can edit the email,
      // go to another view, edit the email again, and come back here. We
      // want the last used email.
      return this.formPrefill.get('email') || this.relier.get('email');
    },

    getEmail () {
      var suggestedAccount = this.getAccount();
      var hasSuggestedAccount = suggestedAccount.get('email');
      return hasSuggestedAccount ?
        suggestedAccount.get('email') : this.getPrefillEmail();
    },

    setInitialContext (context) {
      var suggestedAccount = this.getAccount();
      var hasSuggestedAccount = suggestedAccount.get('email');
      var email = this.getEmail();

      /// submit button
      const buttonSignInText = this.translate(t('Sign in'), { msgctxt: 'submit button' });

      /// header text
      const headerSignInText = this.translate(t('Sign in'), { msgctxt: 'header text' });

      context.set({
        buttonSignInText,
        chooserAskForPassword: this._suggestedAccountAskPassword(suggestedAccount),
        email: email,
        error: this.error,
        headerSignInText,
        isAmoMigration: this.isAmoMigration(),
        isSyncMigration: this.isSyncMigration(),
        password: this.formPrefill.get('password'),
        suggestedAccount: hasSuggestedAccount
      });
    },

    events: {
      'click .use-different': 'useDifferentAccount',
      'click .use-logged-in': 'useLoggedInAccount'
    },

    submit () {
      var account = this.user.initAccount({
        email: this.getElementValue('.email')
      });

      var password = this.getElementValue('.password');

      return this._signIn(account, password);
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
    _signIn (account, password) {
      return this.signIn(account, password)
        .catch(this.onSignInError.bind(this, account, password));
    },

    onSignInError (account, password, err) {
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

    _suggestSignUp (err) {
      if (this.isAmoMigration()) {
        err.forceMessage =
          t('Unknown Firefox Account. <a href="/signup">Sign up</a> using your previous Add-ons account email address to access your Add-ons data.');
        this.$('#amo-migration').hide();
      } else {
        err.forceMessage = t('Unknown account. <a href="/signup">Sign up</a>');
      }

      return this.unsafeDisplayError(err);
    },

    /**
     * Used for the special "Sign In" button
     * which is present when there is already a logged in user in the session
     */
    useLoggedInAccount: allowOnlyOneSubmit(showProgressIndicator(function () {
      var account = this.getAccount();

      return this._signIn(account, null)
        .catch(() => {
          this.chooserAskForPassword = true;
          return this.render().then(() => {
            this.user.removeAccount(account);
            return this.displayError(AuthErrors.toError('SESSION_EXPIRED'));
          });
        });
    })),

    /**
     * Render to a basic sign in view, used with "Use a different account" button
     */
    useDifferentAccount: preventDefaultThen(function () {
      // TODO when the UI allows removal of individual accounts,
      // only clear the current account.
      this.user.removeAllAccounts();
      Session.clear();
      this.formPrefill.clear();
      this.logViewEvent('use-different-account');

      return this.render();
    }),

    /**
     * Get the "suggested" account
     *
     * @returns {Object} the suggested Account
     * @private
     */
    _suggestedAccount () {
      const user = this.user;
      const account = user.getChooserAccount();
      if (this._allowSuggestedAccount(account)) {
        return account;
      } else {
        return user.initAccount({});
      }
    },

    _allowSuggestedAccount (account) {
      const prefillEmail = this.getPrefillEmail();
      return !! (
        // the relier can overrule cached creds.
        this.relier.allowCachedCredentials() &&
        // prefilled email must be the same or absent
        (prefillEmail === account.get('email') || ! prefillEmail)
      );
    },

    /**
     * Determines if the suggested user must be asked for a password.
     * @param {Account} account
     * @returns {Boolean}
     * @private
     */
    _suggestedAccountAskPassword (account) {
      // If there's no email, obviously we'll have to ask for the password.
      if (! account.get('email')) {
        this.logViewEvent('ask-password.shown.account-unknown');
        return true;
      }

      // If the relier wants keys, then the user must authenticate and the password must be requested.
      // This includes sync, which must skip the login chooser at all cost
      if (this.relier.wantsKeys()) {
        this.logViewEvent('ask-password.shown.keys-required');
        return true;
      }

      // We need to ask the user again for their password unless the credentials came from Sync.
      // Otherwise they aren't able to "fully" log out. Only Sync has a clear path to disconnect/log out
      // your account that invalidates your sessionToken.
      if (! this.user.isSyncAccount(account)) {
        this.logViewEvent('ask-password.shown.session-from-web');
        return true;
      }

      // Ask when 'chooserAskForPassword' is explicitly set.
      // This happens in response to an expired session token.
      if (this.chooserAskForPassword === true) {
        this.logViewEvent('ask-password.shown.session-expired');
        return true;
      }

      // Ask when a prefill email does not match the account email.
      var prefillEmail = this.getPrefillEmail();
      if (prefillEmail && prefillEmail !== account.get('email')) {
        this.logViewEvent('ask-password.shown.email-mismatch');
        return true;
      }

      // If none of that is true, it's safe to proceed without asking for the password.
      this.logViewEvent('ask-password.skipped');
      return false;
    }
  });

  Cocktail.mixin(
    View,
    AccountResetMixin,
    AvatarMixin,
    FlowBeginMixin,
    EmailFirstExperimentMixin({ treatmentPathname: '/' }),
    FormPrefillMixin,
    MigrationMixin,
    PasswordMixin,
    PasswordResetMixin,
    ServiceMixin,
    SignInMixin,
    SignedInNotificationMixin
  );

  module.exports = View;
});
