/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'cocktail',
  'views/base',
  'views/form',
  'stache!templates/complete_reset_password',
  'views/mixins/floating-placeholder-mixin',
  'views/mixins/inter-tab-channel-mixin',
  'views/mixins/password-mixin',
  'views/mixins/resume-token-mixin',
  'views/mixins/service-mixin',
  'models/verification/reset-password',
  'lib/auth-errors',
  'lib/url'
],
function (Cocktail, BaseView, FormView, Template, FloatingPlaceholderMixin,
  InterTabChannelMixin, PasswordMixin, ResumeTokenMixin, ServiceMixin,
  VerificationInfo, AuthErrors, Url) {

  'use strict';

  var t = BaseView.t;
  var View = FormView.extend({
    template: Template,
    className: 'complete-reset-password',

    initialize: function (options) {
      options = options || {};

      var searchParams = Url.searchParams(this.window.location.search);
      this._verificationInfo = new VerificationInfo(searchParams);
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
      // The originating tab will start listening for `login` events once
      // it knows the complete reset password tab is open in the same browser.
      this.interTabSend('complete_reset_password_tab_open');
    },

    context: function () {
      var verificationInfo = this._verificationInfo;
      var doesLinkValidate = verificationInfo.isValid();
      var isLinkExpired = verificationInfo.isExpired();

      // damaged and expired links have special messages.
      return {
        isLinkDamaged: ! doesLinkValidate,
        isLinkExpired: isLinkExpired,
        isLinkValid: doesLinkValidate && ! isLinkExpired,
        isPasswordAutoCompleteDisabled: this.isPasswordAutoCompleteDisabled()
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
      // the RP. The only way to do that is for this tab to get a
      // sessionToken that can be used by the original tab. This tab
      // will store the sessionToken in localStorage, when the
      // reset password complete poll completes in the original tab,
      // it will fetch the sessionToken from localStorage and go to town.
      var account = self.user.initAccount({
        email: email,
        password: password
      });

      return self.user.completeAccountPasswordReset(
          account,
          token,
          code,
          self.relier
        )
        .then(function (updatedAccount) {
          self.interTabSend('login', updatedAccount.toJSON());
          // See the above note about notifying the original tab.
          self.logScreenEvent('verification.success');
          return self.invokeBrokerMethod(
                    'afterCompleteResetPassword', updatedAccount);
        })
        .then(function () {
          // the user is definitively signed in here, otherwise this
          // path would not be taken.
          if (self.relier.isDirectAccess()) {
            self.navigate('settings', {
              success: t('Account verified successfully')
            });
          } else {
            self.navigate('reset_password_complete');
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
      return self.fxaClient.passwordReset(
        email,
        self.relier,
        {
          resume: self.getStringifiedResumeToken()
        }
      )
      .then(function (result) {
        self.navigate('confirm_reset_password', {
          data: {
            email: email,
            passwordForgotToken: result.passwordForgotToken
          }
        });
      })
      .fail(self.displayError.bind(self));
    }
  });

  Cocktail.mixin(
    View,
    FloatingPlaceholderMixin,
    InterTabChannelMixin,
    PasswordMixin,
    ResumeTokenMixin,
    ServiceMixin
  );

  return View;
});
