/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Shared implementation of `signIn` view method

import AuthErrors from '../../lib/auth-errors';
import OAuthErrors from '../../lib/oauth-errors';
import NavigateBehavior from '../behaviors/navigate';
import ResumeTokenMixin from './resume-token-mixin';
import VerificationMethods from '../../lib/verification-methods';
import VerificationReasons from '../../lib/verification-reasons';

export default {
  dependsOn: [ResumeTokenMixin],

  /**
   * Sign in a user
   *
   * @param {Account} account - account being signed in to
   *   @param {String} account.sessionToken
   *   Session token from the account
   * @param {String} [password] - the user's password. Can be null if
   *  user is signing in with a sessionToken.
   * @param {Object} [options]
   *   @param {String} [options.unblockCode] - unblock code
   *   @param {Function} [options.onSuccess] - extra success handler to be invoked
   *                                           before this.onSignInSuccess
   * @return {Object} promise
   */
  signIn(account, password, options = {}) {
    if (
      !account ||
      account.isDefault() ||
      (!account.has('sessionToken') && !password)
    ) {
      return Promise.reject(AuthErrors.toError('UNEXPECTED_ERROR'));
    }

    return this.invokeBrokerMethod('beforeSignIn', account)
      .then(() => {
        // Always pass `signin` for viewName regardless of the actual view
        // because we want to log the real action that is being performed.
        // This is important for the infamous signin-from-signup feature.
        this.logFlowEvent('attempt', 'signin');

        let verificationMethod = VerificationMethods.EMAIL_2FA;

        // Check to see if this is an oauth client is requesting 2FA.
        // If it is, set/override the corresponding verificationMethod.
        // Login requests that ask for 2FA but don't have it setup on their account
        // will return an error.
        if (this.relier.isOAuth() && this.relier.wantsTwoStepAuthentication()) {
          verificationMethod = VerificationMethods.TOTP_2FA;
        }

        // Some brokers (e.g. Sync) hand off control of the sessionToken, and hence expect
        // each signin to generate a fresh token.  Make sure that will happen.
        if (
          account.has('sessionToken') &&
          !this.broker.hasCapability('reuseExistingSession')
        ) {
          account.discardSessionToken();
        }

        return this.user.signInAccount(account, password, this.relier, {
          // a resume token is passed in to allow
          // unverified account or session users to complete
          // email verification.
          resume: this.getStringifiedResumeToken(account),
          unblockCode: options.unblockCode,
          verificationMethod: verificationMethod,
        });
      })
      .then((account) => {
        if (this.formPrefill) {
          this.formPrefill.clear();
        }

        if (this.relier.accountNeedsPermissions(account)) {
          return this.navigate('signin_permissions', {
            account: account,
            // the permissions screen will call onSubmitComplete
            // with an updated account
            onSubmitComplete: this.onSignInSuccess.bind(this),
          });
        }

        if (this.relier.shouldOfferToSync(this.viewName)) {
          // flows that are a part of the 'browser' relier which
          // do not pass a service get asked of they want to Sync

          // force_auth attempts do not a choice for Sync
          return this.navigate('would_you_like_to_sync', {
            account: account,
            // ask the user if they want to sync, but don't ask to specify data choices via CWTS
            // see https://github.com/mozilla/fxa/issues/3083 for details
            skipCWTS: true,
            // propagate the onSubmitComplete to choose_what_to_sync screen if needed
            onSubmitComplete: this.onSignInSuccess.bind(this),
          });
        }

        if (typeof options.onSuccess === 'function') {
          options.onSuccess();
        }

        return this.onSignInSuccess(account);
      })
      .catch((err) => {
        if (
          AuthErrors.is(err, 'THROTTLED') ||
          AuthErrors.is(err, 'REQUEST_BLOCKED')
        ) {
          return this.onSignInBlocked(account, password, err);
        }

        if (
          AuthErrors.is(err, 'EMAIL_HARD_BOUNCE') ||
          AuthErrors.is(err, 'EMAIL_SENT_COMPLAINT')
        ) {
          return this.navigate('signin_bounced', {
            email: account.get('email'),
          });
        }

        if (
          AuthErrors.is(err, 'TOTP_REQUIRED') ||
          AuthErrors.is(err, 'INSUFFICIENT_ACR_VALUES') ||
          OAuthErrors.is(err, 'MISMATCH_ACR_VALUES')
        ) {
          return this.navigate('inline_totp_setup', {
            account: account,
            onSubmitComplete: this.onSignInSuccess.bind(this),
          });
        }

        // re-throw error, it'll be handled elsewhere.
        throw err;
      });
  },

  onSignInBlocked(account, password, err) {
    // signin is blocked and can be unblocked.
    if (
      err.verificationReason === VerificationReasons.SIGN_IN &&
      err.verificationMethod === VerificationMethods.EMAIL_CAPTCHA
    ) {
      // Sending the unblock email could itself be rate limited.
      // If it is, the error should be displayed on this screen
      // and the user shouldn't even have the chance to continue.

      return account.sendUnblockEmail().then(() => {
        return this.navigate('signin_unblock', {
          account: account,
          lastPage: this.currentPage,
          password: password,
        });
      });
    }

    // Signin is blocked and cannot be unblocked, show the
    // error at another level.
    return Promise.reject(err);
  },

  onSignInSuccess(account) {
    if (!account.get('verified')) {
      const verificationMethod = account.get('verificationMethod');
      const verificationReason = account.get('verificationReason');

      if (
        (verificationReason === VerificationReasons.SIGN_IN &&
          verificationMethod === VerificationMethods.EMAIL) ||
        (verificationReason === VerificationReasons.CHANGE_PASSWORD &&
          verificationMethod === VerificationMethods.EMAIL)
      ) {
        return this.navigate('confirm_signin', { account });
      }

      if (
        (verificationReason === VerificationReasons.SIGN_IN &&
          verificationMethod === VerificationMethods.EMAIL_OTP) ||
        (verificationReason === VerificationReasons.CHANGE_PASSWORD &&
          verificationMethod === VerificationMethods.EMAIL_OTP)
      ) {
        return this.navigate('signin_token_code', { account });
      }

      if (
        (verificationReason === VerificationReasons.SIGN_IN &&
          verificationMethod === VerificationMethods.TOTP_2FA) ||
        (verificationReason === VerificationReasons.CHANGE_PASSWORD &&
          verificationMethod === VerificationMethods.TOTP_2FA)
      ) {
        return this.navigate('signin_totp_code', { account });
      }

      if (
        verificationReason === VerificationReasons.SIGN_UP &&
        verificationMethod === VerificationMethods.EMAIL_OTP
      ) {
        return this.navigate('confirm_signup_code', { account });
      }

      if (
        verificationReason === VerificationReasons.SIGN_UP &&
        typeof verificationMethod === 'undefined'
      ) {
        // cached signin with an unverified account. A code
        // is not re-sent automatically, so send a new one
        // and then go to the confirm screen.
        return account.verifySessionResendCode().then(() => {
          this.navigate('confirm_signup_code', { account });
        });
      }

      return this.navigate('confirm', { account });
    }

    // If the account's uid changed, update the relier model or else
    // the user can end up in a permanent "Session Expired" state
    // when signing into Sync via force_auth. This occurs because
    // Sync opens force_auth with a uid. The uid could have changed. We
    // sign the user in here with the new uid, then attempt to do
    // other operations with the old uid. Not all brokers support
    // uid changes, so only make the update if the broker supports
    // the change. See #3057 and #3283
    if (
      account.get('uid') !== this.relier.get('uid') &&
      this.broker.hasCapability('allowUidChange')
    ) {
      this.relier.set('uid', account.get('uid'));
    } else if (account.get('email') !== this.relier.get('email')) {
      // if the broker does not support `allowUidChange`, we still
      // need to update `email` and `uid` otherwise login will fail
      // for a deleted account. See #4316
      this.relier.set('email', account.get('email'));
      this.relier.set('uid', account.get('uid'));
    }

    // This is the generic signin.success metric. The one
    // true signin success metric.
    this.logEvent('signin.success');

    // This event is emitted whenever a user skips login
    // confirmation, whether it was required or not.
    this.logEvent('signin.success.skip-confirm');

    // This event ties the signin success to a screen.
    // Currently, can be oauth, signin, signup, signin-unblock
    this.logViewEvent('signin.success');

    const brokerMethod = this.afterSignInBrokerMethod || 'afterSignIn';
    const navigateData = this.afterSignInNavigateData || {};

    if (this.relier.get('redirectTo')) {
      // If `redirectTo` is specified, override the default behavior and
      // redirect to the requested page.
      const behavior = new NavigateBehavior(this.relier.get('redirectTo'));
      this.relier.unset('redirectTo');
      this.broker.setBehavior(brokerMethod, behavior, navigateData);
    }

    // Brokers handle all next steps.
    return this.invokeBrokerMethod(brokerMethod, account);
  },
};
