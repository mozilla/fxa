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
  'lib/constants',
  'lib/session',
  'views/mixins/password-mixin',
  'lib/auth-errors',
  'lib/validate',
  'views/mixins/service-mixin',
  'views/decorators/button_progress_indicator'
],
function (_, p, BaseView, FormView, SignInTemplate, Constants, Session, PasswordMixin, AuthErrors, Validate, ServiceMixin, showButtonProgressIndicator) {
  var t = BaseView.t;

  var View = FormView.extend({
    template: SignInTemplate,
    className: 'sign-in',

    initialize: function (options) {
      options = options || {};

      // reset any force auth status.
      Session.set('forceAuth', false);
      this.service = Session.service;
    },

    context: function () {
      // Session.prefillEmail comes first because users can edit the email,
      // go to another screen, edit the email again, and come back here. We
      // want the last used email.
      this.prefillEmail = Session.prefillEmail || this.searchParam('email');

      return {
        service: this.service,
        serviceName: this.serviceName,
        email: this.prefillEmail,
        suggestedUser: this._suggestedUser(),
        chooserAskForPassword: this._suggestedUserAskPassword(),
        password: Session.prefillPassword,
        isSync: this.isSync(),
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

    beforeRender: function() {
      var self = this;
      return p().then(function () {
          return FormView.prototype.beforeRender.call(self);
        })
        .then(function () {
          if (self.hasService() && self.isSync()) {
            return self.setServiceInfo();
          }
        });
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
          return self.fxaClient.signIn(email, credentials.password);
        } else if (credentials.sessionToken) {
          return self.fxaClient.recoveryEmailStatus(credentials.sessionToken);
        } else {
          p.reject();
        }
      })
        .then(function (accountData) {
          if (accountData.verified) {
            return self.onSignInSuccess();
          } else {
            return self.onSignInUnverified();
          }
        })
        .then(null, function (err) {
          if (AuthErrors.is(err, 'UNKNOWN_ACCOUNT')) {
            return self._suggestSignUp(err);
          } else if (AuthErrors.is(err, 'USER_CANCELED_LOGIN')) {
            self.logEvent('login:canceled');
            // if user canceled login, just stop
            return;
          }
          // re-throw error, it will be handled at a lower level.
          throw err;
        });
    },

    onSignInSuccess: function() {
      // Don't switch to settings if we're trying to log in to
      // Firefox. Firefox will show its own landing page
      if (Session.get('context') !== Constants.FX_DESKTOP_CONTEXT) {
        this.navigate('settings');
      }

      return true;
    },

    onSignInUnverified: function() {
      var self = this;

      return self.fxaClient.signUpResend()
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
    useLoggedInAccount: showButtonProgressIndicator(function() {
      var self = this;

      return this._signIn(Session.email, {
        sessionToken: Session.sessionToken
      })
        .then(
          null,
          function () {
            self.chooserAskForPassword = true;
            return self.render()
              .then(function () {
                return self.displayError(AuthErrors.toError('SESSION_EXPIRED'));
              });
          });
    }),

    /**
     * Render to a basic sign in view, used with "Use a different account" button
     */
    useDifferentAccount: BaseView.preventDefaultThen(function () {
      this.skipUserSuggestion = true;
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
      if (
        // confirm that session token and email are present
        Session.sessionToken && Session.email &&
        // prefilled email must be the same or absent
        (this.prefillEmail === Session.email || ! this.prefillEmail) &&
        // must not be manually disabled
        ! this.skipUserSuggestion
      ) {
        return {
          email: Session.email,
          avatar: Session.avatar
        };
      } else {
        return null;
      }
    },

    /**
     * Determines if the suggested user must be asked for a password.
     * @private
     */
    _suggestedUserAskPassword: function () {
      // sync must always use a password login to generate keys, skip the login chooser at all cost
      if (this.isSync()) {
        return true;
      }

      // shows when 'chooserAskForPassword' already set or
      return !!(this.chooserAskForPassword === true ||
          // or when a prefill email does not match the session
          (this.prefillEmail && this.prefillEmail !== Session.email));
    }
  });

  _.extend(View.prototype, PasswordMixin);
  _.extend(View.prototype, ServiceMixin);

  return View;
});
