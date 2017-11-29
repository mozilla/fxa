/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const AuthErrors = require('../lib/auth-errors');
  const Cocktail = require('cocktail');
  const FloatingPlaceholderMixin = require('./mixins/floating-placeholder-mixin');
  const FormView = require('./form');
  const FlowEventsMixin = require('./mixins/flow-events-mixin');
  const Notifier = require('../lib/channels/notifier');
  const PasswordMixin = require('./mixins/password-mixin');
  const PasswordResetMixin = require('./mixins/password-reset-mixin');
  const ResendMixin = require('./mixins/resend-mixin')();
  const ServiceMixin = require('./mixins/service-mixin');
  const Template = require('stache!templates/complete_reset_password');
  const Url = require('../lib/url');
  const VerificationInfo = require('../models/verification/reset-password');

  const proto = FormView.prototype;
  const View = FormView.extend({
    template: Template,
    className: 'complete-reset-password',

    initialize (options) {
      options = options || {};

      var searchParams = Url.searchParams(this.window.location.search);
      this._verificationInfo = new VerificationInfo(searchParams);
    },

    getAccount () {
      const email = this._verificationInfo.get('email');

      return this.user.initAccount({ email });
    },

    // beforeRender is asynchronous and returns a promise. Only render
    // after beforeRender has finished its business.
    beforeRender () {
      var verificationInfo = this._verificationInfo;
      if (! verificationInfo.isValid()) {
        // One or more parameters fails validation. Abort and show an
        // error message before doing any more checks.
        this.logError(AuthErrors.toError('DAMAGED_VERIFICATION_LINK'));
        return;
      }

      const account = this.getAccount();
      const token = verificationInfo.get('token');
      return account.isPasswordResetComplete(token)
        .then((isComplete) => {
          if (isComplete) {
            verificationInfo.markExpired();
            this.logError(AuthErrors.toError('EXPIRED_VERIFICATION_LINK'));
          }
        });
    },

    afterVisible () {
      // The originating tab will start listening for `login` events once
      // it knows the complete reset password tab is open in the same browser.
      this.notifier.triggerRemote(Notifier.COMPLETE_RESET_PASSWORD_TAB_OPEN);
      return proto.afterVisible.call(this);
    },

    setInitialContext (context) {
      var verificationInfo = this._verificationInfo;
      var doesLinkValidate = verificationInfo.isValid();
      var isLinkExpired = verificationInfo.isExpired();
      var showSyncWarning = this.relier.get('resetPasswordConfirm');

      // damaged and expired links have special messages.
      context.set({
        email: verificationInfo.get('email'),
        isLinkDamaged: ! doesLinkValidate,
        isLinkExpired: isLinkExpired,
        isLinkValid: doesLinkValidate && ! isLinkExpired,
        showSyncWarning: showSyncWarning
      });
    },

    isValidEnd () {
      return this._getPassword() === this._getVPassword();
    },

    showValidationErrorsEnd () {
      if (this._getPassword() !== this._getVPassword()) {
        var err = AuthErrors.toError('PASSWORDS_DO_NOT_MATCH');
        this.displayError(err);
      }
    },

    submit () {
      var verificationInfo = this._verificationInfo;
      var password = this._getPassword();
      var token = verificationInfo.get('token');
      var code = verificationInfo.get('code');

      // If the user verifies in the same browser and the original tab
      // is still open, we want the original tab to redirect back to
      // the RP. The only way to do that is for this tab to get a
      // sessionToken that can be used by the original tab. This tab
      // will store the sessionToken in localStorage, when the
      // reset password complete poll completes in the original tab,
      // it will fetch the sessionToken from localStorage and go to town.
      var account = this.getAccount();

      return this.user.completeAccountPasswordReset(
          account,
          password,
          token,
          code,
          this.relier
        )
        .then((updatedAccount) => {
          // The password was reset, future attempts should ask confirmation.
          this.relier.set('resetPasswordConfirm', true);
          // See the above note about notifying the original tab.
          this.logViewEvent('verification.success');
          return this.invokeBrokerMethod(
                    'afterCompleteResetPassword', updatedAccount);
        })
        .then(() => {
          this.navigate('reset_password_verified');
        })
        .catch((err) => {
          if (AuthErrors.is(err, 'INVALID_TOKEN')) {
            this.logError(err);
            // The token has expired since the first check, re-render to
            // show a view that allows the user to receive a new link.
            return this.render();
          }

          // all other errors are unexpected, bail.
          throw err;
        });
    },

    _getPassword () {
      return this.$('#password').val();
    },

    _getVPassword () {
      return this.$('#vpassword').val();
    },

    resend () {
      return this.resetPassword(this._verificationInfo.get('email'));
    }
  });

  Cocktail.mixin(
    View,
    FloatingPlaceholderMixin,
    FlowEventsMixin,
    PasswordMixin,
    PasswordResetMixin,
    ResendMixin,
    ServiceMixin
  );

  module.exports = View;
});
