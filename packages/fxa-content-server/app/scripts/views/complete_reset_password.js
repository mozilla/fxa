/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import _ from 'underscore';
import AuthErrors from '../lib/auth-errors';
import Cocktail from 'cocktail';
import FormView from './form';
import FlowEventsMixin from './mixins/flow-events-mixin';
import Notifier from '../lib/channels/notifier';
import PasswordMixin from './mixins/password-mixin';
import PasswordResetMixin from './mixins/password-reset-mixin';
import PasswordStrengthMixin from './mixins/password-strength-mixin';
import preventDefaultThen from './decorators/prevent_default_then';
import ResendMixin from './mixins/resend-mixin';
import ServiceMixin from './mixins/service-mixin';
import Template from 'templates/complete_reset_password.mustache';
import Url from '../lib/url';
import VerificationInfo from '../models/verification/reset-password';
import AccountRecoveryVerificationInfo from '../models/verification/account-recovery';

const proto = FormView.prototype;
const View = FormView.extend({
  template: Template,
  className: 'complete-reset-password',

  events: _.extend({}, FormView.prototype.events, {
    'click .remember-password': preventDefaultThen('_navigateToSignin'),
  }),

  _navigateToSignin() {
    this.navigate('signin');
  },

  initialize(options) {
    options = options || {};

    const searchParams = Url.searchParams(this.window.location.search);
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
      this._accountRecoveryVerficationInfo = new AccountRecoveryVerificationInfo(
        model.toJSON()
      );
    }
  },

  getAccount() {
    const email = this._verificationInfo.get('email');

    return this.user.initAccount({ email });
  },

  // beforeRender is asynchronous and returns a promise. Only render
  // after beforeRender has finished its business.
  beforeRender() {
    this.logViewEvent('verification.clicked');

    const verificationInfo = this._verificationInfo;
    if (!verificationInfo.isValid()) {
      // One or more parameters fails validation. Abort and show an
      // error message before doing any more checks.
      this.logError(AuthErrors.toError('DAMAGED_VERIFICATION_LINK'));
      return;
    }

    const account = this.getAccount();
    const token = verificationInfo.get('token');
    return account.isPasswordResetComplete(token).then((isComplete) => {
      if (this._accountRecoveryVerficationInfo || this.lostRecoveryKey) {
        return;
      }

      if (isComplete && !this._accountRecoveryVerficationInfo) {
        verificationInfo.markExpired();
        this.logError(AuthErrors.toError('EXPIRED_VERIFICATION_LINK'));
        return;
      }

      // When the user clicks the confirm password reset link from their
      // email, we should check to see if they have an account recovery key.
      // If so, navigate to the confirm recovery key view, else continue with
      // a regular password reset.
      return account.checkRecoveryKeyExistsByEmail().then((result) => {
        if (result.exists) {
          return this.navigate('account_recovery_confirm_key');
        }
      });
    });
  },

  afterVisible() {
    // The originating tab will start listening for `login` events once
    // it knows the complete reset password tab is open in the same browser.
    this.notifier.triggerRemote(Notifier.COMPLETE_RESET_PASSWORD_TAB_OPEN);
    return proto.afterVisible.call(this);
  },

  setInitialContext(context) {
    const verificationInfo = this._verificationInfo;
    const doesLinkValidate = verificationInfo.isValid();
    const isLinkExpired = verificationInfo.isExpired();
    let showSyncWarning = this.relier.get('resetPasswordConfirm');
    const showAccountRecoveryInfo = !!this._accountRecoveryVerficationInfo;

    if (showAccountRecoveryInfo) {
      // Don't show the sync warning if the user is resetting password with
      // account recovery
      showSyncWarning = false;
    }

    // damaged and expired links have special messages.
    context.set({
      email: verificationInfo.get('email'),
      isLinkDamaged: !doesLinkValidate,
      isLinkExpired: isLinkExpired,
      isLinkValid: doesLinkValidate && !isLinkExpired,
      showAccountRecoveryInfo: showAccountRecoveryInfo,
      showSyncWarning: showSyncWarning,
    });
  },

  isValidEnd() {
    return this._getPassword() === this._getVPassword();
  },

  showValidationErrorsEnd() {
    if (this._getPassword() !== this._getVPassword()) {
      const err = AuthErrors.toError('PASSWORDS_DO_NOT_MATCH');
      this.displayError(err);
    }
  },

  submit() {
    const verificationInfo = this._verificationInfo;
    const password = this._getPassword();
    const token = verificationInfo.get('token');
    const code = verificationInfo.get('code');
    const emailToHashWith = verificationInfo.get('emailToHashWith');

    // If the user verifies in the same browser and the original tab
    // is still open, we want the original tab to redirect back to
    // the RP. The only way to do that is for this tab to get a
    // sessionToken that can be used by the original tab. This tab
    // will store the sessionToken in localStorage, when the
    // reset password complete poll completes in the original tab,
    // it will fetch the sessionToken from localStorage and go to town.
    const account = this.getAccount();

    return Promise.resolve()
      .then(() => {
        // The account recovery verification info will be set from the
        // `confirm recovery key` view. If the are not set, then perform
        // a regular password reset.
        const accountRecoveryVerificationInfo = this
          ._accountRecoveryVerficationInfo;
        if (accountRecoveryVerificationInfo) {
          return this.user.completeAccountPasswordResetWithRecoveryKey(
            account,
            password,
            accountRecoveryVerificationInfo.get('accountResetToken'),
            accountRecoveryVerificationInfo.get('recoveryKeyId'),
            accountRecoveryVerificationInfo.get('kB'),
            this.relier,
            emailToHashWith
          );
        }

        return this.user.completeAccountPasswordReset(
          account,
          password,
          token,
          code,
          this.relier,
          emailToHashWith
        );
      })
      .then((updatedAccount) => {
        // The password was reset, future attempts should ask confirmation.
        this.relier.set('resetPasswordConfirm', true);
        // See the above note about notifying the original tab.
        this.logViewEvent('verification.success');
        return this.invokeBrokerMethod(
          'afterCompleteResetPassword',
          updatedAccount
        );
      })
      .then(() => {
        const accountRecoveryVerificationInfo = this
          ._accountRecoveryVerficationInfo;
        if (!accountRecoveryVerificationInfo) {
          this.navigate('reset_password_verified');
        } else {
          this.metrics.logUserPreferences('account-recovery', false);
          this.logFlowEventOnce('recovery-key-consume.success', this.viewName);
          this.navigate('reset_password_with_recovery_key_verified');
        }
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

  _getPassword() {
    return this.$('#password').val();
  },

  _getVPassword() {
    return this.$('#vpassword').val();
  },

  resend() {
    return this.resetPassword(this._verificationInfo.get('email'));
  },
});

Cocktail.mixin(
  View,
  FlowEventsMixin,
  PasswordMixin,
  PasswordResetMixin,
  PasswordStrengthMixin({
    balloonEl: '.helper-balloon',
    passwordEl: '#password',
  }),
  ResendMixin(),
  ServiceMixin
);

export default View;
