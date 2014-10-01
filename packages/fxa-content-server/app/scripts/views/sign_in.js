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
  'views/decorators/progress_indicator'
],
function (_, p, BaseView, FormView, SignInTemplate, Session, PasswordMixin, AuthErrors, Validate, ServiceMixin, showProgressIndicator) {
  var t = BaseView.t;

  var View = FormView.extend({
    template: SignInTemplate,
    className: 'sign-in',

    context: function () {
      // Session.prefillEmail comes first because users can edit the email,
      // go to another screen, edit the email again, and come back here. We
      // want the last used email.
      this.prefillEmail = Session.prefillEmail || this.searchParam('email');

      var suggestedUser = this._suggestedUser();

      return {
        service: this.relier.get('service'),
        serviceName: this.relier.get('serviceName'),
        email: this.prefillEmail,
        suggestedUser: suggestedUser,
        chooserAskForPassword: this._suggestedUserAskPassword(),
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
          return self.broker.checkCanLinkAccount(email)
            .then(function () {
              return self.fxaClient.signIn(
                  email, credentials.password, self.relier);
            });
        } else if (credentials.sessionToken) {
          return self.fxaClient.recoveryEmailStatus(credentials.sessionToken);
        } else {
          p.reject();
        }
      })
      .then(function (accountData) {
        if (accountData.verified) {
          self.logScreenEvent('success');
          return self.onSignInSuccess();
        } else {
          return self.onSignInUnverified();
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

    onSignInSuccess: function () {
      var self = this;
      return self.broker.afterSignIn(self)
        .then(function () {
          return self.broker.shouldShowSettingsAfterSignIn();
        })
        .then(function (shouldShowSettings) {
          if (shouldShowSettings) {
            self.navigate('settings');
          }
        });
    },

    onSignInUnverified: function () {
      var self = this;

      return self.fxaClient.signUpResend(self.relier)
        .then(function () {
          self.navigate('confirm');
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

      return this._signIn(Session.cachedCredentials.email, {
        sessionToken: Session.cachedCredentials.sessionToken
      })
      .then(
        null,
        function () {
          self.chooserAskForPassword = true;
          return self.render()
            .then(function () {
              Session.clear('cachedCredentials');
              return self.displayError(AuthErrors.toError('SESSION_EXPIRED'));
            });
        });
    }),

    /**
     * Render to a basic sign in view, used with "Use a different account" button
     */
    useDifferentAccount: BaseView.preventDefaultThen(function () {
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
    _suggestedUser: function () {
      var cachedEmail = Session.email;
      var cachedSessionToken = Session.sessionToken;
      var cachedAvatar = Session.avatar;

      if (Session.cachedCredentials) {
        cachedEmail = Session.cachedCredentials.email;
        cachedSessionToken = Session.cachedCredentials.sessionToken;
        cachedAvatar = Session.cachedCredentials.avatar;
      }

      if (
        // confirm that session token and email are present
        cachedSessionToken && cachedEmail &&
        // prefilled email must be the same or absent
        (this.prefillEmail === cachedEmail || ! this.prefillEmail)
      ) {
        return {
          email: cachedEmail,
          avatar: cachedAvatar
        };
      } else {
        return null;
      }
    },

    _areCachedCredentialsFromSync: function () {
      return !!Session.cachedCredentials;
    },

    /**
     * Determines if the suggested user must be asked for a password.
     * @private
     */
    _suggestedUserAskPassword: function () {
      // sync must always use a password login to generate keys, skip the login chooser at all cost
      if (this.relier.isSync()) {
        return true;
      }

      // We need to ask the user again for their password unless the credentials came from Sync.
      // Otherwise they aren't able to "fully" log out. Only Sync has a clear path to disconnect/log out
      // your account that invalidates your sessionToken.
      if (! this._areCachedCredentialsFromSync()) {
        return true;
      }

      // shows when 'chooserAskForPassword' already set or
      return !!(this.chooserAskForPassword === true ||
          // or when a prefill email does not match the cached email
          (this.prefillEmail && this.prefillEmail !== Session.cachedCredentials.email));
    }
  });

  _.extend(View.prototype, PasswordMixin);
  _.extend(View.prototype, ServiceMixin);

  return View;
});
