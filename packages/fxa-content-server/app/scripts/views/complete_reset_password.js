/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'cocktail',
  'views/base',
  'views/form',
  'stache!templates/complete_reset_password',
  'views/mixins/password-mixin',
  'views/mixins/floating-placeholder-mixin',
  'lib/validate',
  'lib/auth-errors',
  'views/mixins/service-mixin',
  'models/verification/reset-password',
  'lib/url'
],
function (Cocktail, BaseView, FormView, Template, PasswordMixin,
      FloatingPlaceholderMixin, Validate, AuthErrors, ServiceMixin,
      VerificationInfo, Url) {
  var t = BaseView.t;
  var View = FormView.extend({
    template: Template,
    className: 'complete-reset-password',

    initialize: function (options) {
      options = options || {};

      var searchParams = Url.searchParams(this.window.location.search);
      this._verificationInfo = new VerificationInfo(searchParams);

      // We use the interTabChannel rather than notifications because we only
      // want to send account data to other tabs– not listeners on all channels.
      this._interTabChannel = options.interTabChannel;
    },

    events: {
      'click #resend': BaseView.preventDefaultThen('resendResetEmail')
    },

    // beforeRender is asynchronous and returns a promise. Only render
    // after beforeRender has finished its business.
    beforeRender: function () {
      var self = this;

      var verificationInfo = this._verificationInfo;
      if (! verificationInfo.isValid()) {
        // One or more parameters fails validation. Abort and show an
        // error message before doing any more checks.
        self.logError(AuthErrors.toError('DAMAGED_VERIFICATION_LINK'));
        return true;
      }

      var token = verificationInfo.get('token');
      return this.fxaClient.isPasswordResetComplete(token)
        .then(function (isComplete) {
          if (isComplete) {
            verificationInfo.markExpired();
            self.logError(AuthErrors.toError('EXPIRED_VERIFICATION_LINK'));
          }
          return true;
        });
    },

    afterRender: function () {
      this.initializePlaceholderFields();
    },

    context: function () {
      var verificationInfo = this._verificationInfo;
      var doesLinkValidate = verificationInfo.isValid();
      var isLinkExpired = verificationInfo.isExpired();

      // damaged and expired links have special messages.
      return {
        isPasswordAutoCompleteDisabled: this.isPasswordAutoCompleteDisabled(),
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
        var err = AuthErrors.toError('PASSWORDS_DO_NOT_MATCH');
        this.displayError(err);
      }
    },

    submit: function () {
      var self = this;
      var verificationInfo = this._verificationInfo;
      var email = verificationInfo.get('email');
      var password = self._getPassword();
      var token = verificationInfo.get('token');
      var code = verificationInfo.get('code');

      // If the user verifies in the same browser and the original tab
      // is still open, we want the original tab to redirect back to
      // the RP. The only way to do that is for this tab to sign in and
      // get a sessionToken. When the reset password complete poll
      // completes in the original tab, it will fetch the sessionToken
      // from localStorage and go to town.
      return self.fxaClient.completePasswordReset(email, password, token, code)
        .then(function () {
          return self.fxaClient.signIn(email, password, self.relier);
        }).then(function (accountData) {
          var account = self.user.initAccount(accountData);
          self._interTabChannel.send('login', accountData);

          return self.user.setSignedInAccount(account)
            .then(function () {
              return account;
            });
        })
        .then(function (account) {
          // See the above note about notifying the original tab.
          self.logScreenEvent('verification.success');
          return self.broker.afterCompleteResetPassword(account);
        })
        .then(function (result) {
          if (! (result && result.halt)) {
            // the user is definitively signed in here, otherwise this
            // path would not be taken.
            if (self.relier.isDirectAccess()) {
              self.navigate('settings', {
                success: t('Account verified successfully')
              });
            } else {
              self.navigate('reset_password_complete');
            }
          }
        })
        .then(null, function (err) {
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
      self.logScreenEvent('resend');
      var email = self._verificationInfo.get('email');
      return self.fxaClient.passwordReset(email, self.relier)
              .then(function (result) {
                self.navigate('confirm_reset_password', {
                  data: {
                    email: email,
                    passwordForgotToken: result.passwordForgotToken
                  }
                });
              }, function (err) {
                self.displayError(err);
              });
    }
  });

  Cocktail.mixin(
    View,
    PasswordMixin,
    ServiceMixin,
    FloatingPlaceholderMixin
  );

  return View;
});
