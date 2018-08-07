/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const AuthErrors = require('../lib/auth-errors');
  const Cocktail = require('cocktail');
  const FormView = require('./form');
  const FlowEventsMixin = require('./mixins/flow-events-mixin');
  const Notifier = require('../lib/channels/notifier');
  const PasswordMixin = require('./mixins/password-mixin');
  const PasswordResetMixin = require('./mixins/password-reset-mixin');
  const ResendMixin = require('./mixins/resend-mixin')();
  const ServiceMixin = require('./mixins/service-mixin');
  const Template = require('templates/complete_reset_password.mustache');
  const Url = require('../lib/url');
  const VerificationInfo = require('../models/verification/reset-password');
  const AccountRecoveryVerificationInfo = require('../models/verification/account-recovery');

  const proto = FormView.prototype;
  const View = FormView.extend({
    template: Template,
    className: 'complete-reset-password',

    events: _.extend({}, FormView.prototype.events, {
      'click .remember-password': FormView.preventDefaultThen('_navigateToSignin')
    }),

    _navigateToSignin: function () {
      this.navigate('signin');
    },

    initialize (options) {
      options = options || {};

      var searchParams = Url.searchParams(this.window.location.search);
      this._verificationInfo = new VerificationInfo(searchParams);

      const model = options.model;

      // If this property is set, this will ensure that a regular password reset
      // is preformed by *not* setting any `recoveryKeyId` data.
      this.lostRecoveryKey = model && model.get('lostRecoveryKey');
      if (this.lostRecoveryKey) {
        return;
      }

      // If the complete password screen was navigated from the account recovery confirm
      // key view, then these properties must be set in order to recover the account
      // using the recovery key.
      if (model && model.get('recoveryKeyId')) {
        this._accountRecoveryVerficationInfo = new AccountRecoveryVerificationInfo(model.toJSON());
      }
    },

    getAccount () {
      const email = this._verificationInfo.get('email');

      return this.user.initAccount({ email });
    },

    // beforeRender is asynchronous and returns a promise. Only render
    // after beforeRender has finished its business.
    beforeRender () {
      this.logViewEvent('verification.clicked');

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

          if (this._accountRecoveryVerficationInfo || this.lostRecoveryKey) {
            return;
          }

          if (isComplete && ! this._accountRecoveryVerficationInfo) {
            verificationInfo.markExpired();
            this.logError(AuthErrors.toError('EXPIRED_VERIFICATION_LINK'));
            return;
          }

          // When the user clicks the confirm password reset link from their
          // email, we should check to see if they have an account recovery key.
          // If so, navigate to the confirm recovery key view, else continue with
          // a regular password reset.
          return account.checkRecoveryKeyExistsByEmail()
            .then((result) => {
              if (result.exists) {
                return this.navigate('account_recovery_confirm_key');
              }
            });
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
      const showAccountRecoveryInfo = !! this._accountRecoveryVerficationInfo;

      if (showAccountRecoveryInfo) {
        // Don't show the sync warning if the user is reseting password with
        // account recovery
        showSyncWarning = false;
      }

      // damaged and expired links have special messages.
      context.set({
        email: verificationInfo.get('email'),
        isLinkDamaged: ! doesLinkValidate,
        isLinkExpired: isLinkExpired,
        isLinkValid: doesLinkValidate && ! isLinkExpired,
        showAccountRecoveryInfo: showAccountRecoveryInfo,
        showSyncWarning: showSyncWarning,
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

      return Promise.resolve()
        .then(() => {

          // The account recovery verification info will be set from the
          // `confirm recovery key` view. If the are not set, then perform
          // a regular password reset.
          const accountRecoveryVerificationInfo = this._accountRecoveryVerficationInfo;
          if (accountRecoveryVerificationInfo) {
            return this.user.completeAccountPasswordResetWithRecoveryKey(
              account,
              password,
              accountRecoveryVerificationInfo.get('accountResetToken'),
              accountRecoveryVerificationInfo.get('recoveryKeyId'),
              accountRecoveryVerificationInfo.get('kB'),
              this.relier);
          }

          return this.user.completeAccountPasswordReset(
            account,
            password,
            token,
            code,
            this.relier);
        })
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
            delete this._accountRecoveryVerficationInfo;
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
    FlowEventsMixin,
    PasswordMixin,
    PasswordResetMixin,
    ResendMixin,
    ServiceMixin
  );

  module.exports = View;
});
