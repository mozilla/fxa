/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'lib/promise',
  'views/base',
  'views/form',
  'stache!templates/sign_in',
  'lib/session',
  'views/mixins/password-mixin',
  'lib/auth-errors',
  'lib/validate',
  'views/mixins/service-mixin',
  'views/mixins/avatar-mixin',
  'views/decorators/progress_indicator'
],
function (_, p, BaseView, FormView, SignInTemplate, Session, PasswordMixin,
      AuthErrors, Validate, ServiceMixin, AvatarMixin, showProgressIndicator) {
  var t = BaseView.t;

  var View = FormView.extend({
    template: SignInTemplate,
    className: 'sign-in',

    context: function () {
      // Session.prefillEmail comes first because users can edit the email,
      // go to another screen, edit the email again, and come back here. We
      // want the last used email.
      this.prefillEmail = Session.prefillEmail || this.searchParam('email');

      var suggestedAccount = this._suggestedAccount();
      var hasSuggestedAccount = suggestedAccount.get('email');
      var email = hasSuggestedAccount ?
                    suggestedAccount.get('email') : this.prefillEmail;

      return {
        service: this.relier.get('service'),
        serviceName: this.relier.get('serviceName'),
        email: email,
        suggestedAccount: hasSuggestedAccount,
        chooserAskForPassword: this._suggestedAccountAskPassword(suggestedAccount),
        password: Session.prefillPassword,
        error: this.error
      };
    },

    events: {
      'change .show-password': 'onPasswordVisibilityChange',
      'click a[href="/reset_password"]': 'resetPasswordIfKnownValidEmail',
      'click .use-logged-in': 'useLoggedInAccount',
      'click .use-different': 'useDifferentAccount'
    },

    afterRender: function () {
      this.transformLinks();
      return FormView.prototype.afterRender.call(this);
    },

    afterVisible: function () {
      FormView.prototype.afterVisible.call(this);
      return this._displayProfileImage(this._suggestedAccount());
    },

    beforeDestroy: function () {
      Session.set('prefillEmail', this.$('.email').val());
      Session.set('prefillPassword', this.$('.password').val());
    },

    submit: function () {
      var email = this.$('.email').val();
      var password = this.$('.password').val();

      return this._signIn(email, {
        password: password
      });
    },

    /**
     *
     * @param {String} email
     * @param {Object} credentials
     *     Credentials object should either provied a password or a sessionToken
     *     @param {String} credentials.password
     *     User password from the input
     *     @param {String} credentials.sessionToken
     *     Session token from the session
     * @private
     */
    _signIn: function (email, credentials) {
      var self = this;
      if (! email || ! credentials) {
        p.reject();
      }

      return p().then(function () {
        if (credentials.password) {
          return self.broker.beforeSignIn(email)
            .then(function () {
              return self.fxaClient.signIn(
                  email, credentials.password, self.relier, self.user);
            });
        } else if (credentials.sessionToken) {
          return self.fxaClient.recoveryEmailStatus(credentials.sessionToken);
        } else {
          p.reject();
        }
      })
      .then(function (accountData) {
        if (self.user.createAccount(accountData).get('verified')) {
          self.logScreenEvent('success');
          return self.onSignInSuccess(accountData);
        } else {
          return self.onSignInUnverified(accountData);
        }
      })
      .then(null, function (err) {
        if (AuthErrors.is(err, 'UNKNOWN_ACCOUNT')) {
          return self._suggestSignUp(err);
        } else if (AuthErrors.is(err, 'USER_CANCELED_LOGIN')) {
          self.logScreenEvent('canceled');
          // if user canceled login, just stop
          return;
        }
        // re-throw error, it will be handled at a lower level.
        throw err;
      });
    },

    onSignInSuccess: function (accountData) {
      var self = this;
      return self.broker.afterSignIn(accountData)
        .then(function (result) {
          if (! (result && result.halt)) {
            self.navigate('settings');
          }

          return result;
        });
    },

    onSignInUnverified: function (accountData) {
      var self = this;
      var sessionToken = self.currentAccount().get('sessionToken');

      return self.fxaClient.signUpResend(self.relier, sessionToken)
        .then(function () {
          self.navigate('confirm', {
            data: {
              accountData: accountData
            }
          });
        });
    },

    onPasswordResetNavigate: function () {
      this.navigate('reset_password');
    },

    _suggestSignUp: function (err) {
      err.forceMessage = t('Unknown account. <a href="/signup">Sign up</a>');
      return this.displayErrorUnsafe(err);
    },

    resetPasswordIfKnownValidEmail: BaseView.preventDefaultThen(function () {
      var self = this;
      return p().then(function () {
        self.onPasswordResetNavigate();
      });
    }),

    /**
     * Used for the special "Sign In" button
     * which is present when there is already a logged in user in the session
     */
    useLoggedInAccount: showProgressIndicator(function () {
      var self = this;
      var account = this._suggestedAccount();

      return this._signIn(account.get('email'), {
        sessionToken: account.get('sessionToken')
      })
      .fail(
        function () {
          self.chooserAskForPassword = true;
          return self.render()
            .then(function () {
              self.user.removeAccount(account);
              return self.displayError(AuthErrors.toError('SESSION_EXPIRED'));
            });
        });
    }),

    /**
     * Render to a basic sign in view, used with "Use a different account" button
     */
    useDifferentAccount: BaseView.preventDefaultThen(function () {
      // TODO when the UI allows removal of individual accounts,
      // only clear the current account.
      this.user.removeAllAccounts();
      Session.clear();

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

      if (
        // confirm that session email is present
        account.get('email') && account.get('sessionToken') &&
        // prefilled email must be the same or absent
        (this.prefillEmail === account.get('email') || ! this.prefillEmail)
      ) {
        return account;
      } else {
        return this.user.createAccount();
      }
    },

    /**
     * Determines if the suggested user must be asked for a password.
     * @private
     */
    _suggestedAccountAskPassword: function (account) {
      // sync must always use a password login to generate keys, skip the login chooser at all cost
      if (this.relier.isSync()) {
        return true;
      }

      // We need to ask the user again for their password unless the credentials came from Sync.
      // Otherwise they aren't able to "fully" log out. Only Sync has a clear path to disconnect/log out
      // your account that invalidates your sessionToken.
      if (! this.user.isSyncAccount(account)) {
        return true;
      }

      // shows when 'chooserAskForPassword' already set or
      return !!(this.chooserAskForPassword === true ||
          // or when a prefill email does not match the account email
          (this.prefillEmail && this.prefillEmail !== account.get('email')));
    }
  });

  _.extend(View.prototype, PasswordMixin);
  _.extend(View.prototype, ServiceMixin);
  _.extend(View.prototype, AvatarMixin);

  return View;
});
