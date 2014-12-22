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
  'views/decorators/allow_only_one_submit',
  'views/decorators/progress_indicator'
],
function (_, p, BaseView, FormView, SignInTemplate, Session, PasswordMixin,
      AuthErrors, Validate, ServiceMixin, AvatarMixin, allowOnlyOneSubmit,
      showProgressIndicator) {
  var t = BaseView.t;

  var View = FormView.extend({
    template: SignInTemplate,
    className: 'sign-in',

    beforeRender: function () {
      // Session.prefillEmail comes first because users can edit the email,
      // go to another screen, edit the email again, and come back here. We
      // want the last used email. Session.prefillEmail is not until after
      // the view initializes.
      this.prefillEmail = Session.prefillEmail || this.searchParam('email');

      this._account = this._suggestedAccount();
    },

    getAccount: function () {
      return this._account;
    },

    context: function () {
      var suggestedAccount = this.getAccount();
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
      return this._displayProfileImage(this.getAccount());
    },

    beforeDestroy: function () {
      Session.set('prefillEmail', this.getElementValue('.email'));
      Session.set('prefillPassword', this.getElementValue('.password'));
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
      if (! account || account.isEmpty()) {
        p.reject();
      }

      return p().then(function () {
        if (account.get('password')) {
          return self.broker.beforeSignIn(account.get('email'))
            .then(function () {
              return self.fxaClient.signIn(account.get('email'),
                      account.get('password'), self.relier);
            })
            .then(function (updatedSessionData) {
              account.set(updatedSessionData);
              return account;
            });
        } else if (account.get('sessionToken')) {
          // We have a cached Sync session so just check that it hasn't expired.
          return self.fxaClient.recoveryEmailStatus(account.get('sessionToken'))
            .then(function (result) {
              // The result includes the latest verified state
              account.set(result);
              return account;
            });
        } else {
          p.reject();
        }
      })
      .then(function (account) {
        return self.user.setSignedInAccount(account)
          .then(function () {
            return account;
          });
      })
      .then(function (account) {
        if (account.get('verified')) {
          self.logScreenEvent('success');
          return self.onSignInSuccess(account);
        } else {
          return self.onSignInUnverified(account);
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

    onSignInSuccess: function (account) {
      var self = this;
      return self.broker.afterSignIn(account)
        .then(function (result) {
          if (! (result && result.halt)) {
            self.navigate('settings');
          }

          return result;
        });
    },

    onSignInUnverified: function (account) {
      var self = this;
      var sessionToken = account.get('sessionToken');

      return self.fxaClient.signUpResend(self.relier, sessionToken)
        .then(function () {
          self.navigate('confirm', {
            data: {
              account: account
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
        return this.user.initAccount();
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
