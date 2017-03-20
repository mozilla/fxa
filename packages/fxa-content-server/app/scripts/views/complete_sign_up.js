/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Complete sign up is used to complete the email verification for one
 * of three types of users:
 *
 * 1. New users that just signed up.
 * 2. Existing users that have signed in with an unverified account.
 * 3. Existing users that are signing into Sync and
 *    must re-confirm their account.
 *
 * The auth server endpoints that are called are the same in all cases.
 */

define(function (require, exports, module) {
  'use strict';

  const AuthErrors = require('lib/auth-errors');
  const BaseView = require('views/base');
  const Cocktail = require('cocktail');
  const CompleteSignUpTemplate = require('stache!templates/complete_sign_up');
  const ExperimentMixin = require('views/mixins/experiment-mixin');
  const MarketingEmailErrors = require('lib/marketing-email-errors');
  const p = require('lib/promise');
  const ResendMixin = require('views/mixins/resend-mixin')();
  const ResumeTokenMixin = require('views/mixins/resume-token-mixin');
  const t = BaseView.t;
  const VerificationInfo = require('models/verification/sign-up');
  const VerificationReasonMixin = require('views/mixins/verification-reason-mixin');

  const CompleteSignUpView = BaseView.extend({
    template: CompleteSignUpTemplate,
    className: 'complete_sign_up',

    initialize (options = {}) {
      this._verificationInfo = new VerificationInfo(this.getSearchParams());
      const uid = this._verificationInfo.get('uid');

      const account = options.account || this.user.getAccountByUid(uid);
      // the account will not exist if verifying in a second browser, and the
      // default account will be returned. Add the uid to the account so
      // verification can still occur.
      if (account.isDefault()) {
        account.set('uid', uid);
      }

      this._account = account;

      // cache the email in case we need to attempt to resend the
      // verification link
      this._email = this._account.get('email');
    },

    getAccount () {
      return this._account;
    },

    beforeRender () {
      const verificationInfo = this._verificationInfo;
      if (! verificationInfo.isValid()) {
        // One or more parameters fails validation. Abort and show an
        // error message before doing any more checks.
        this.logError(AuthErrors.toError('DAMAGED_VERIFICATION_LINK'));
        return true;
      }

      const account = this.getAccount();
      // Loads the email from the resume token to smooth out the signin
      // flow if the user verifies in a 2nd Firefox.
      account.populateFromStringifiedResumeToken(this.getSearchParam('resume'));

      const code = verificationInfo.get('code');
      const options = {
        reminder: verificationInfo.get('reminder'),
        service: this.relier.get('service')
      };

      return this.user.completeAccountSignUp(account, code, options)
        .fail((err) => this._logAndAbsorbMarketingClientErrors(err))
        .then(() => this._notifyBrokerAndComplete(account))
        .fail((err) => this._handleVerificationErrors(err));
    },

    context () {
      const verificationInfo = this._verificationInfo;
      return {
        canResend: this._canResend(),
        error: this.model.get('error'),
        // If the link is invalid, print a special error message.
        isLinkDamaged: ! verificationInfo.isValid(),
        isLinkExpired: verificationInfo.isExpired(),
        isLinkUsed: verificationInfo.isUsed()
      };
    },

    /**
     * Log and swallow any errors that are generated from attempting to
     * sign up the user to marketing email.
     *
     * @param {Error} err
     * @private
     */
    _logAndAbsorbMarketingClientErrors (err) {
      if (MarketingEmailErrors.created(err)) {
        // A basket error should not prevent the
        // sign up verification from completing, nor
        // should an error be displayed to the user.
        // Log the error and nothing else.
        this.logError(err);
      } else {
        throw err;
      }
    },

    /**
     * Notify the broker that signup is complete. If the broker does not halt,
     * navigate to the next screen.
     *
     * @param {Object} account
     * @returns {Promise}
     * @private
     */
    _notifyBrokerAndComplete (account) {
      this.logViewEvent('verification.success');
      this.notifier.trigger('verification.success');

      // Emitting an explicit signin event here
      // allows us to capture successes that might be
      // triggered from confirmation emails.
      if (this.isSignIn()) {
        this.logEvent('signin.success');
      }

      // Update the stored account data in case it was
      // updated by completeAccountSignUp.
      this.user.setAccount(account);
      return this.invokeBrokerMethod('afterCompleteSignUp', account)
        .then(() => this._navigateToNextScreen());
    },

    /**
     * Navigate to the next screen after verification has completed.
     *
     * @returns {Promise}
     * @private
     */
    _navigateToNextScreen () {
      const account = this.getAccount();
      const relier = this.relier;

      return p().then(() => {
        if (relier.isSync()) {
          return p.all([
            this._isEligibleToSendSms(account),
            this._isEligibleToConnectAnotherDevice(account)
          ]).spread((isEligibleToSendSms, isEligibleToConnectAnotherDevice) => {
            if (isEligibleToSendSms) {
              // Sync users that are part of the experiment group who verify
              // are sent to "connect another device". If the experiment proves
              // useful, all users will be sent there.
              this.navigate('sms', { account });
            } else if (isEligibleToConnectAnotherDevice) {
              // Sync users that are part of the experiment group who verify
              // are sent to "connect another device". If the experiment proves
              // useful, all users will be sent there.
              this.navigate('connect_another_device', { account });
            } else {
              this._navigateToVerifiedScreen();
            }
          });
        } else if (relier.isOAuth()) {
          // If an OAuth user makes it here, they are either not signed in
          // or are verifying in a different tab. Show the "Account
          // verified!" screen to the user, the correct tab will have
          // already transitioned back to the relier.
          this._navigateToVerifiedScreen();
        } else {
          return account.isSignedIn()
            .then((isSignedIn) => {
              if (isSignedIn) {
                this.navigate('settings', {
                  success: t('Account verified successfully')
                });
              } else {
                this._navigateToVerifiedScreen();
              }
            });
        }
      });
    },

    /**
     * Check if the user is eligible to connect another device
     *
     * @param {Object} verifiedAccount - account that was just verified.
     * @returns {Boolean}
     */
    _isEligibleToConnectAnotherDevice (verifiedAccount) {
      // Only show to users who are signing up, until we have better text for
      // users who are signing in.
      if (this.isSignIn()) {
        return false;
      }

      const isInExperimentGroup = this.isInExperimentGroup('connectAnotherDevice', 'treatment');
      const isAnotherUserSignedIn = this._isAnotherUserSignedIn(verifiedAccount);

      if (isInExperimentGroup && isAnotherUserSignedIn) {
        // log that another user is signed in to see how often this happens.
        this.notifier.trigger('connectAnotherDevice.other_user_signed_in');
      }

      // If a user is already signed in to Sync which is different to the
      // user that just verified, show them the old "Account verified!" screen.
      return isInExperimentGroup && ! isAnotherUserSignedIn;
    },

    /**
     * Check if the user is eligible to send an _isEligibleToSendSms
     *
     * @param {Object} verifiedAccount - account that was just verified.
     * @returns {Promise} - resolves to `true` if user can send an SMS,
     *  `false` otw.
     * @private
     */
    _isEligibleToSendSms (verifiedAccount) {
      return p().then(() => {
        if (this.isSignIn()) {
          return false;
        }

        const isInExperimentGroup = this.isInExperimentGroup('sendSms', 'treatment');
        const isAnotherUserSignedIn = this._isAnotherUserSignedIn(verifiedAccount);

        // If a user is already signed in to Sync which is different to the
        // user that just verified, show them the old "Account verified!" screen.
        return isInExperimentGroup && ! isAnotherUserSignedIn;
      });
    },

    /**
     * Check if an account that is not `account` is signed in.
     *
     * @param {Object} account account to check.
     * @returns {Boolean} `true` if another user is signed in, `false` otw.
     * @private
     */
    _isAnotherUserSignedIn(account) {
      const user = this.user;
      return (! user.getSignedInAccount().isDefault() &&
              ! user.isSignedInAccount(account));

    },

    /**
     * Navigate to the correct *_verified screen.
     *
     * @private
     */
    _navigateToVerifiedScreen () {
      if (this.isSignUp()) {
        this.navigate('signup_verified');
      } else {
        this.navigate('signin_verified');
      }
    },

    /**
     * Handle any verification errors.
     *
     * @param {Error} err
     * @private
     */
    _handleVerificationErrors (err) {
      const verificationInfo = this._verificationInfo;

      if (AuthErrors.is(err, 'UNKNOWN_ACCOUNT')) {
        verificationInfo.markExpired();
        err = AuthErrors.toError('UNKNOWN_ACCOUNT_VERIFICATION');
      } else if (
          AuthErrors.is(err, 'INVALID_VERIFICATION_CODE') ||
          AuthErrors.is(err, 'INVALID_PARAMETER')) {

        // When coming from sign-in confirmation verification, show a
        // verification link expired error instead of damaged verification link.
        // This error is generated because the link has already been used.
        if (this.isSignIn()) {
          // Disable resending verification, can only be triggered from new sign-in
          verificationInfo.markUsed();
          err = AuthErrors.toError('REUSED_SIGNIN_VERIFICATION_CODE');
        } else {
          // These server says the verification code or any parameter is
          // invalid. The entire link is damaged.
          verificationInfo.markDamaged();
          err = AuthErrors.toError('DAMAGED_VERIFICATION_LINK');
        }
      } else {
        // all other errors show the standard error box.
        this.model.set('error', err);
      }

      this.logError(err);
    },

    /**
     * Check whether the user can resend a signup verification email to allow
     * users to recover from expired verification links.
     *
     * @returns {Boolean}
     * @private
     */
    _canResend () {
      // _hasResendSessionToken only returns `true` if the user signed up in the
      // same browser in which they opened the verification link.
      return !! this._hasResendSessionToken() && this.isSignUp();
    },

    /**
     * Returns whether a sessionToken exists for the user's email.
     * The sessionToken is not cached during view initialization so that
     * we can capture sessionTokens from accounts created (in this browser)
     * since the view was loaded.
     *
     * @returns {Boolean}
     * @private
     */
    _hasResendSessionToken () {
      return !! this.user.getAccountByEmail(this._email).get('sessionToken');
    },

    /**
     * Resend a signup verification link to the user. Called when a
     * user follows an expired verification link and clicks "resend"
     *
     * @returns {Promise}
     */
    resend () {
      const account = this.user.getAccountByEmail(this._email);
      return account.retrySignUp(this.relier, {
        resume: this.getStringifiedResumeToken(account)
      })
      .fail((err) => {
        if (AuthErrors.is(err, 'INVALID_TOKEN')) {
          return this.navigate('signup', {
            error: err
          });
        }

        // unexpected error, rethrow for display.
        throw err;
      });
    }
  });

  Cocktail.mixin(
    CompleteSignUpView,
    ExperimentMixin,
    ResendMixin,
    ResumeTokenMixin,
    VerificationReasonMixin
  );

  module.exports = CompleteSignUpView;
});
