/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'views/base',
  'views/form',
  'stache!templates/complete_reset_password',
  'lib/session',
  'lib/password-mixin',
  'lib/validate',
  'lib/auth-errors',
  'lib/oauth-mixin'
],
function (_, BaseView, FormView, Template, Session, PasswordMixin, Validate, AuthErrors, OAuthMixin) {
  var t = BaseView.t;

  var View = FormView.extend({
    template: Template,
    className: 'complete_reset_password',

    events: {
      'change .show-password': 'onPasswordVisibilityChange',
      'click #resend': BaseView.preventDefaultThen('resendResetEmail')
    },

    // beforeRender is asynchronous and returns a promise. Only render
    // after beforeRender has finished its business.
    beforeRender: function () {
      try {
        this.importSearchParam('token');
        this.importSearchParam('code');
        this.importSearchParam('email');
      } catch(e) {
        // This is an invalid link. Abort and show an error message
        // before doing any more checks.
        this.logEvent('complete_reset_password:link_damaged');
        return true;
      }

      // Remove any spaces that are probably due to a MUA adding
      // line breaks in the middle of the link.
      this.token = this.token.replace(/ /g, '');
      this.code = this.code.replace(/ /g, '');

      if (! this._doesLinkValidate()) {
        // One or more parameters fails validation. Abort and show an
        // error message before doing any more checks.
        this.logEvent('complete_reset_password:link_damaged');
        return true;
      }

      var self = this;
      return this.fxaClient.isPasswordResetComplete(this.token)
         .then(function (isComplete) {
            self._isLinkExpired = isComplete;
            self.logEvent('complete_reset_password:link_expired');
            return true;
          });
    },

    afterRender: function() {
      this.togglePlaceholderPattern();
    },

    _doesLinkValidate: function () {
      return Validate.isTokenValid(this.token) &&
             Validate.isCodeValid(this.code) &&
             Validate.isEmailValid(this.email);
    },

    context: function () {
      var doesLinkValidate = this._doesLinkValidate();
      var isLinkExpired = this._isLinkExpired;

      // damaged and expired links have special messages.
      return {
        isSync: Session.isSync(),
        isLinkDamaged: ! doesLinkValidate,
        isLinkExpired: isLinkExpired,
        isLinkValid: doesLinkValidate && ! isLinkExpired
      };
    },

    isValidEnd: function () {
      return this._getPassword() === this._getVPassword();
    },

    showValidationErrorsEnd: function () {
      if (this._getPassword() !== this._getVPassword()) {
        this.displayError(t('Passwords do not match'));
      }
    },

    submit: function () {
      var password = this._getPassword();

      var self = this;
      return this.fxaClient.completePasswordReset(this.email, password, this.token, this.code)
          .then(function () {
            // Get a new sessionToken if we're in an OAuth flow
            // so that we can generate FxA assertions
            if (self.isOAuthSameBrowser()) {
              // cache oauth params because signIn will clear them
              var params = Session.oauth;
              return self.fxaClient.signIn(self.email, password)
                .then(function () {
                  // restore oauth params
                  Session.set('oauth', params);
                });
            }
          })
          .then(function () {
            self.navigate('reset_password_complete');
          }, function (err) {
            if (AuthErrors.is(err, 'INVALID_TOKEN')) {
              self.logError(err);
              // The token has expired since the first check, re-render to
              // show a screen that allows the user to receive a new link.
              return self.render();
            }

            // all other errors are unexpected, bail.
            throw err;
          });
    },

    _getPassword: function () {
      return this.$('#password').val();
    },

    _getVPassword: function () {
      return this.$('#vpassword').val();
    },

    resendResetEmail: function () {
      var self = this;
      return this.fxaClient.passwordReset(this.email)
              .then(function () {
                self.navigate('confirm_reset_password');
              }, function (err) {
                self.displayError(err);
              });
    }
  });

  _.extend(View.prototype, PasswordMixin);
  _.extend(View.prototype, OAuthMixin);

  return View;
});
