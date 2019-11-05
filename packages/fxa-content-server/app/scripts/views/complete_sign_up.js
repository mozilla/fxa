/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Complete sign up is used to complete the email verification for
 * multiple types of users:
 *
 * 1. New users that just signed up.
 * 2. Existing users that have signed in with an unverified account.
 * 3. Existing users that are signing into Sync and
 *    must re-confirm their account.
 * 4. Existing users that confirmed a secondary email.
 *
 * The auth server endpoints that are called are the same in all cases.
 */

import AuthErrors from '../lib/auth-errors';
import BaseView from './base';
import Cocktail from 'cocktail';
import CompleteSignUpTemplate from 'templates/complete_sign_up.mustache';
import ConnectAnotherDeviceMixin from './mixins/connect-another-device-mixin';
import ResendMixin from './mixins/resend-mixin';
import ResumeTokenMixin from './mixins/resume-token-mixin';
import VerificationInfo from '../models/verification/sign-up';

const CompleteSignUpView = BaseView.extend({
  template: CompleteSignUpTemplate,
  className: 'complete_sign_up',

  initialize(options = {}) {
    this._verificationInfo = new VerificationInfo(this.getSearchParams());
    const uid = this._verificationInfo.get('uid');

    this.notifier.trigger('set-uid', uid);

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

  getAccount() {
    return this._account;
  },

  beforeRender() {
    this.logViewEvent('verification.clicked');

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
      primaryEmailVerified:
        this.getSearchParam('primary_email_verified') || null,
      reminder: verificationInfo.get('reminder'),
      secondaryEmailVerified:
        this.getSearchParam('secondary_email_verified') || null,
      service: this.relier.get('service') || null,
      style: this.relier.get('style') || null,
      type: verificationInfo.get('type'),
    };

    return this.user
      .completeAccountSignUp(account, code, options)
      .then(() => this._notifyBrokerAndComplete(account))
      .catch(err => this._handleVerificationErrors(err));
  },

  setInitialContext(context) {
    const verificationInfo = this._verificationInfo;
    context.set({
      canResend: this._canResend(),
      error: this.model.get('error'),
      // If the link is invalid, print a special error message.
      isLinkDamaged: ! verificationInfo.isValid(),
      isLinkExpired: verificationInfo.isExpired(),
      isLinkUsed: verificationInfo.isUsed(),
      isPrimaryEmailVerification: this.isPrimaryEmail(),
    });
  },

  /**
   * Notify the broker that the email is verified. Brokers are
   * expected to take care of any next steps.
   *
   * @param {Object} account
   * @returns {Promise}
   * @private
   */
  _notifyBrokerAndComplete(account) {
    this.logViewEvent('verification.success');
    this.notifier.trigger('verification.success');

    // Emitting an explicit signin event here
    // allows us to capture successes that might be
    // triggered from confirmation emails.
    if (this.isSignIn()) {
      this.logEvent('signin.success');
    }

    const brokerMethod = this._getBrokerMethod();
    // The brokers handle all next steps.
    return this.invokeBrokerMethod(brokerMethod, account);
  },

  /**
   * Get the post-verification broker method name.
   *
   * @returns {String}
   * @throws Error if suitable broker method is not available.
   */
  _getBrokerMethod() {
    let brokerMethod;
    if (this.isPrimaryEmail()) {
      brokerMethod = 'afterCompletePrimaryEmail';
    } else if (this.isSecondaryEmail()) {
      brokerMethod = 'afterCompleteSecondaryEmail';
    } else if (this.isSignIn()) {
      brokerMethod = 'afterCompleteSignIn';
    } else if (this.isSignUp()) {
      brokerMethod = 'afterCompleteSignUp';
    } else {
      throw new Error(`New broker method needed for ${this.model.get('type')}`);
    }
    return brokerMethod;
  },

  /**
   * Handle any verification errors.
   *
   * @param {Error} err
   * @private
   */
  _handleVerificationErrors(err) {
    const verificationInfo = this._verificationInfo;

    if (AuthErrors.is(err, 'UNKNOWN_ACCOUNT')) {
      verificationInfo.markExpired();
      err = AuthErrors.toError('UNKNOWN_ACCOUNT_VERIFICATION');
    } else if (
      AuthErrors.is(err, 'INVALID_VERIFICATION_CODE') ||
      AuthErrors.is(err, 'INVALID_PARAMETER')
    ) {
      if (this.isPrimaryEmail()) {
        verificationInfo.markUsed();
        err = AuthErrors.toError('REUSED_PRIMARY_EMAIL_VERIFICATION_CODE');
      } else if (this.isSignIn()) {
        // When coming from sign-in confirmation verification, show a
        // verification link expired error instead of damaged verification link.
        // This error is generated because the link has already been used.
        //
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
  _canResend() {
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
  _hasResendSessionToken() {
    return !! this.user.getAccountByEmail(this._email).get('sessionToken');
  },

  /**
   * Resend a signup verification link to the user. Called when a
   * user follows an expired verification link and clicks "resend"
   *
   * @returns {Promise}
   */
  resend() {
    const account = this.user.getAccountByEmail(this._email);
    return account
      .retrySignUp(this.relier, {
        resume: this.getStringifiedResumeToken(account),
      })
      .catch(err => {
        if (AuthErrors.is(err, 'INVALID_TOKEN')) {
          return this.navigate('signup', {
            error: err,
          });
        }

        // unexpected error, rethrow for display.
        throw err;
      });
  },
});

Cocktail.mixin(
  CompleteSignUpView,
  ConnectAnotherDeviceMixin,
  ResendMixin(),
  ResumeTokenMixin
);

export default CompleteSignUpView;
