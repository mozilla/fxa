/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var AuthErrors = require('lib/auth-errors');
  var BaseView = require('views/base');
  var Cocktail = require('cocktail');
  var FloatingPlaceholderMixin = require('views/mixins/floating-placeholder-mixin');
  var FormView = require('views/form');
  var Notifier = require('lib/channels/notifier');
  var PasswordMixin = require('views/mixins/password-mixin');
  var PasswordResetMixin = require('views/mixins/password-reset-mixin');
  var PasswordStrengthMixin = require('views/mixins/password-strength-mixin');
  var ServiceMixin = require('views/mixins/service-mixin');
  var Template = require('stache!templates/complete_reset_password');
  var Url = require('lib/url');
  var VerificationInfo = require('models/verification/reset-password');

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
      this.notifier.triggerRemote(Notifier.COMPLETE_RESET_PASSWORD_TAB_OPEN);
    },

    context: function () {
      var verificationInfo = this._verificationInfo;
      var doesLinkValidate = verificationInfo.isValid();
      var isLinkExpired = verificationInfo.isExpired();
      var showSyncWarning = this.relier.get('resetPasswordConfirm');

      // damaged and expired links have special messages.
      return {
        isLinkDamaged: ! doesLinkValidate,
        isLinkExpired: isLinkExpired,
        isLinkValid: doesLinkValidate && ! isLinkExpired,
        showSyncWarning: showSyncWarning
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
        email: email
      });

      return self.user.completeAccountPasswordReset(
          account,
          password,
          token,
          code,
          self.relier
        )
        .then(function (updatedAccount) {
          // The password was reset, future attempts should ask confirmation.
          self.relier.set('resetPasswordConfirm', true);
          // See the above note about notifying the original tab.
          self.logViewEvent('verification.success');
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
            // show a view that allows the user to receive a new link.
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
      self.logViewEvent('resend');
      var email = self._verificationInfo.get('email');
      return self.resetPassword(email)
        .fail(self.displayError.bind(self));
    }
  });

  Cocktail.mixin(
    View,
    FloatingPlaceholderMixin,
    PasswordMixin,
    PasswordResetMixin,
    PasswordStrengthMixin,
    ServiceMixin
  );

  module.exports = View;
});
