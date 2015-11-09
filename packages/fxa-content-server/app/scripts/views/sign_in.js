/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var AccountLockedMixin = require('views/mixins/account-locked-mixin');
  var allowOnlyOneSubmit = require('views/decorators/allow_only_one_submit');
  var AuthErrors = require('lib/auth-errors');
  var AvatarMixin = require('views/mixins/avatar-mixin');
  var BaseView = require('views/base');
  var Cocktail = require('cocktail');
  var FormView = require('views/form');
  var MigrationMixin = require('views/mixins/migration-mixin');
  var p = require('lib/promise');
  var PasswordMixin = require('views/mixins/password-mixin');
  var ResumeTokenMixin = require('views/mixins/resume-token-mixin');
  var ServiceMixin = require('views/mixins/service-mixin');
  var Session = require('lib/session');
  var showProgressIndicator = require('views/decorators/progress_indicator');
  var SignedInNotificationMixin = require('views/mixins/signed-in-notification-mixin');
  var SignInTemplate = require('stache!templates/sign_in');
  var SignupDisabledMixin = require('views/mixins/signup-disabled-mixin');

  var t = BaseView.t;

  var View = FormView.extend({
    template: SignInTemplate,
    className: 'sign-in',

    initialize: function (options) {
      options = options || {};

      this._formPrefill = options.formPrefill;
      var data = this.ephemeralData();
      if (data) {
        this._redirectTo = data.redirectTo;
      }
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

    context: function () {
      var suggestedAccount = this.getAccount();
      var hasSuggestedAccount = suggestedAccount.get('email');
      var email = hasSuggestedAccount ?
                    suggestedAccount.get('email') : this.getPrefillEmail();

      return {
        chooserAskForPassword: this._suggestedAccountAskPassword(suggestedAccount),
        email: email,
        error: this.error,
        isMigration: this.isMigration(),
        isPasswordAutoCompleteDisabled: this.isPasswordAutoCompleteDisabled(),
        isSignupDisabled: this.isSignupDisabled(),
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
      return this.displayAccountProfileImage(this.getAccount());
    },

    beforeDestroy: function () {
      this._formPrefill.set('email', this.getElementValue('.email'));
      this._formPrefill.set('password', this.getElementValue('.password'));
    },

    submit: function () {
      var account = this.user.initAccount({
        email: this.getElementValue('.email'),
        password: this.getElementValue('.password')
      });

      return this._signIn(account);
    },

    /**
     *
     * @param {Account} account
     *     The account instance should either include a password or a sessionToken
     *     @param {String} account.password
     *     User password from the input
     *     @param {String} account.sessionToken
     *     Session token from the account
     * @private
     */
    _signIn: function (account) {
      var self = this;
      if (! account || account.isDefault()) {
        return p.reject(AuthErrors.toError('UNEXPECTED_ERROR'));
      }

      return self.invokeBrokerMethod('beforeSignIn', account.get('email'))
        .then(function () {
          return self.user.signInAccount(account, self.relier, {
            // a resume token is passed in to handle unverified users.
            resume: self.getStringifiedResumeToken()
          });
        })
        .then(function (account) {
          // formPrefill information is no longer needed after the user
          // has successfully signed in. Clear the info to ensure
          // passwords aren't sticking around in memory.
          self._formPrefill.clear();

          if (self.relier.accountNeedsPermissions(account)) {
            self.navigate('signin_permissions', {
              data: {
                account: account
              }
            });

            return false;
          }

          if (account.get('verified')) {
            return self.onSignInSuccess(account);
          }

          return self.onSignInUnverified(account);
        })
        .fail(self.onSignInError.bind(self, account));
    },

    onSignInError: function (account, err) {
      var self = this;

      if (AuthErrors.is(err, 'UNKNOWN_ACCOUNT') && ! this.isSignupDisabled()) {
        return self._suggestSignUp(err);
      } else if (AuthErrors.is(err, 'USER_CANCELED_LOGIN')) {
        self.logViewEvent('canceled');
        // if user canceled login, just stop
        return;
      } else if (AuthErrors.is(err, 'ACCOUNT_LOCKED')) {
        return self.notifyOfLockedAccount(account);
      }
      // re-throw error, it will be handled at a lower level.
      throw err;
    },

    onSignInSuccess: function (account) {
      var self = this;
      self.logViewEvent('success');
      return self.invokeBrokerMethod('afterSignIn', account)
        .then(function () {
          self.navigate(self._redirectTo || 'settings');
        });
    },

    onSignInUnverified: function (account) {
      this.navigate('confirm', {
        data: {
          account: account
        }
      });
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

      return this._signIn(account)
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
    AvatarMixin,
    MigrationMixin,
    PasswordMixin,
    ResumeTokenMixin,
    ServiceMixin,
    SignedInNotificationMixin,
    SignupDisabledMixin
  );

  module.exports = View;
});
