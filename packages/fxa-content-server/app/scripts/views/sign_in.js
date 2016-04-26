/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var AccountLockedMixin = require('views/mixins/account-locked-mixin');
  var AccountResetMixin = require('views/mixins/account-reset-mixin');
  var allowOnlyOneSubmit = require('views/decorators/allow_only_one_submit');
  var AuthErrors = require('lib/auth-errors');
  var AvatarMixin = require('views/mixins/avatar-mixin');
  var BaseView = require('views/base');
  var Cocktail = require('cocktail');
  var FlowBeginMixin = require('views/mixins/flow-begin-mixin');
  var FormView = require('views/form');
  var MigrationMixin = require('views/mixins/migration-mixin');
  var PasswordMixin = require('views/mixins/password-mixin');
  var PasswordResetMixin = require('views/mixins/password-reset-mixin');
  var ResumeTokenMixin = require('views/mixins/resume-token-mixin');
  var ServiceMixin = require('views/mixins/service-mixin');
  var Session = require('lib/session');
  var showProgressIndicator = require('views/decorators/progress_indicator');
  var SignedInNotificationMixin = require('views/mixins/signed-in-notification-mixin');
  var SignInMixin = require('views/mixins/signin-mixin');
  var SignInTemplate = require('stache!templates/sign_in');
  var SignUpDisabledMixin = require('views/mixins/signup-disabled-mixin');

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
        isSignupDisabled: this.isSignupDisabled(),
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
     * @param {string} [password] - the user's password. Can be null if
     *  user is signing in with a sessionToken.
     * @private
     */
    _signIn: function (account, password) {
      return this.signIn(account, password)
        .fail(this.onSignInError.bind(this, account, password));
    },

    onSignInError: function (account, password, err) {
      var self = this;

      if (AuthErrors.is(err, 'UNKNOWN_ACCOUNT') && ! this.isSignupDisabled()) {
        return self._suggestSignUp(err);
      } else if (AuthErrors.is(err, 'USER_CANCELED_LOGIN')) {
        self.logViewEvent('canceled');
        // if user canceled login, just stop
        return;
      } else if (AuthErrors.is(err, 'ACCOUNT_LOCKED')) {
        return self.notifyOfLockedAccount(account, password);
      } else if (AuthErrors.is(err, 'ACCOUNT_RESET')) {
        return self.notifyOfResetAccount(account);
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
      var self = this;
      var account = this.getAccount();

      return this._signIn(account, null)
        .fail(
          function () {
            self.chooserAskForPassword = true;
            return self.render()
              .then(function () {
                self.user.removeAccount(account);
                return self.displayError(AuthErrors.toError('SESSION_EXPIRED'));
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
    AccountLockedMixin,
    AccountResetMixin,
    AvatarMixin,
    FlowBeginMixin,
    MigrationMixin,
    PasswordMixin,
    PasswordResetMixin,
    ResumeTokenMixin,
    ServiceMixin,
    SignInMixin,
    SignUpDisabledMixin,
    SignedInNotificationMixin
  );

  module.exports = View;
});
