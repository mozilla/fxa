/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const AccountResetMixin = require('views/mixins/account-reset-mixin');
  const allowOnlyOneSubmit = require('views/decorators/allow_only_one_submit');
  const AuthErrors = require('lib/auth-errors');
  const AvatarMixin = require('views/mixins/avatar-mixin');
  const BaseView = require('views/base');
  const Cocktail = require('cocktail');
  const ExperimentMixin = require('views/mixins/experiment-mixin');
  const FlowBeginMixin = require('views/mixins/flow-begin-mixin');
  const FormView = require('views/form');
  const MigrationMixin = require('views/mixins/migration-mixin');
  const PasswordMixin = require('views/mixins/password-mixin');
  const PasswordResetMixin = require('views/mixins/password-reset-mixin');
  const ResumeTokenMixin = require('views/mixins/resume-token-mixin');
  const ServiceMixin = require('views/mixins/service-mixin');
  const Session = require('lib/session');
  const showProgressIndicator = require('views/decorators/progress_indicator');
  const SignedInNotificationMixin = require('views/mixins/signed-in-notification-mixin');
  const SignInMixin = require('views/mixins/signin-mixin');
  const SignInTemplate = require('stache!templates/sign_in');

  var t = BaseView.t;

  var View = FormView.extend({
    template: SignInTemplate,
    className: 'sign-in',

    initialize: function (options) {
      options = options || {};

      this._formPrefill = options.formPrefill;
    },

    beforeRender: function () {
      this._account = this._suggestedAccount();

      this._account.on('change:accessToken', () => {
        // if no access token and password is not visible we need to show the password field.
        if (! this._account.has('accessToken') && this.$('.password').is(':hidden')) {
          // accessToken could be changed async by an external request after render
          // If the ProfileClient fails to get an OAuth token with the current token then reset the view
          this.chooserAskForPassword = true;
          return this.render().then(function () {
            this.setDefaultPlaceholderAvatar();
          });
        }
      });
    },

    getAccount: function () {
      return this._account;
    },

    getPrefillEmail: function () {
      // formPrefill.email comes first because users can edit the email,
      // go to another view, edit the email again, and come back here. We
      // want the last used email.
      return this._formPrefill.get('email') || this.relier.get('email');
    },

    getEmail: function () {
      var suggestedAccount = this.getAccount();
      var hasSuggestedAccount = suggestedAccount.get('email');
      return hasSuggestedAccount ?
        suggestedAccount.get('email') : this.getPrefillEmail();
    },

    context: function () {
      var suggestedAccount = this.getAccount();
      var hasSuggestedAccount = suggestedAccount.get('email');
      var email = this.getEmail();

      return {
        chooserAskForPassword: this._suggestedAccountAskPassword(suggestedAccount),
        email: email,
        error: this.error,
        isSyncMigration: this.isSyncMigration(),
        password: this._formPrefill.get('password'),
        serviceName: this.relier.get('serviceName'),
        suggestedAccount: hasSuggestedAccount
      };
    },

    events: {
      'click .use-different': 'useDifferentAccount',
      'click .use-logged-in': 'useLoggedInAccount'
    },

    afterRender: function () {
      this.transformLinks();
      return FormView.prototype.afterRender.call(this);
    },

    afterVisible: function () {
      FormView.prototype.afterVisible.call(this);
      return this.displayAccountProfileImage(this.getAccount(), { spinner: true });
    },

    beforeDestroy: function () {
      this._formPrefill.set('email', this.getElementValue('.email'));
      this._formPrefill.set('password', this.getElementValue('.password'));
    },

    submit: function () {
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
    _signIn: function (account, password) {
      return this.signIn(account, password)
        .fail(this.onSignInError.bind(this, account, password));
    },

    onSignInError: function (account, password, err) {
      if (AuthErrors.is(err, 'UNKNOWN_ACCOUNT')) {
        return this._suggestSignUp(err);
      } else if (AuthErrors.is(err, 'USER_CANCELED_LOGIN')) {
        this.logViewEvent('canceled');
        // if user canceled login, just stop
        return;
      } else if (AuthErrors.is(err, 'ACCOUNT_RESET')) {
        return this.notifyOfResetAccount(account);
      }
      // re-throw error, it will be handled at a lower level.
      throw err;
    },

    _suggestSignUp: function (err) {
      err.forceMessage = t('Unknown account. <a href="/signup">Sign up</a>');
      return this.displayErrorUnsafe(err);
    },

    /**
     * Used for the special "Sign In" button
     * which is present when there is already a logged in user in the session
     */
    useLoggedInAccount: allowOnlyOneSubmit(showProgressIndicator(function () {
      var account = this.getAccount();

      return this._signIn(account, null)
        .fail(() => {
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
    useDifferentAccount: BaseView.preventDefaultThen(function () {
      // TODO when the UI allows removal of individual accounts,
      // only clear the current account.
      this.user.removeAllAccounts();
      Session.clear();
      this._formPrefill.clear();
      this.logViewEvent('use-different-account');

      return this.render();
    }),

    /**
     * Determines if the user should be suggested for the signin flow.
     *
     * @returns {Object|null}
     *          Returns user information if the user should be suggested
     *          Returns "null" if the current signin view must not suggest users.
     * @private
     */
    _suggestedAccount: function () {
      var account = this.user.getChooserAccount();
      var prefillEmail = this.getPrefillEmail();

      if (
        // the relier can overrule cached creds.
        this.relier.allowCachedCredentials() &&
        // confirm that session email is present
        account.get('email') && account.get('sessionToken') &&
        // prefilled email must be the same or absent
        (prefillEmail === account.get('email') || ! prefillEmail)
      ) {
        return account;
      } else {
        return this.user.initAccount();
      }
    },

    /**
     * Determines if the suggested user must be asked for a password.
     * @param {Account} account
     * @returns {Boolean}
     * @private
     */
    _suggestedAccountAskPassword: function (account) {
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
    ExperimentMixin,
    FlowBeginMixin,
    MigrationMixin,
    PasswordMixin,
    PasswordResetMixin,
    ResumeTokenMixin,
    ServiceMixin,
    SignInMixin,
    SignedInNotificationMixin
  );

  module.exports = View;
});
