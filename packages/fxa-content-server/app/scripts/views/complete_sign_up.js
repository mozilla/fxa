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

  var AuthErrors = require('lib/auth-errors');
  var BaseView = require('views/base');
  var Cocktail = require('cocktail');
  var CompleteSignUpTemplate = require('stache!templates/complete_sign_up');
  var ExperimentMixin = require('views/mixins/experiment-mixin');
  var FormView = require('views/form');
  var MarketingEmailErrors = require('lib/marketing-email-errors');
  var ResendMixin = require('views/mixins/resend-mixin');
  var ResumeTokenMixin = require('views/mixins/resume-token-mixin');
  var Url = require('lib/url');
  var VerificationInfo = require('models/verification/sign-up');
  var VerificationReasonMixin = require('views/mixins/verification-reason-mixin');

  var t = BaseView.t;

  var CompleteSignUpView = FormView.extend({
    template: CompleteSignUpTemplate,
    className: 'complete_sign_up',

    events: {
      // validateAndSubmit is used to prevent multiple concurrent submissions.
      'click #resend': BaseView.preventDefaultThen('validateAndSubmit')
    },

    initialize: function (options) {
      options = options || {};

      var searchParams = Url.searchParams(this.window.location.search);
      this._verificationInfo = new VerificationInfo(searchParams);
      var uid = this._verificationInfo.get('uid');

      var account = options.account || this.user.getAccountByUid(uid);
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

    getAccount: function () {
      return this._account;
    },

    _navigateToCompleteScreen: function () {
      if (this.isSignUp()) {
        this.navigate('signup_complete');
      } else {
        this.navigate('signin_complete');
      }
    },

    beforeRender: function () {
      var self = this;
      var verificationInfo = self._verificationInfo;
      if (! verificationInfo.isValid()) {
        // One or more parameters fails validation. Abort and show an
        // error message before doing any more checks.
        self.logError(AuthErrors.toError('DAMAGED_VERIFICATION_LINK'));
        return true;
      }

      var code = verificationInfo.get('code');
      var options = {
        reminder: self._verificationInfo.get('reminder'),
        service: self.relier.get('service')
      };
      return self.user.completeAccountSignUp(self.getAccount(), code, options)
          .fail(function (err) {
            if (MarketingEmailErrors.created(err)) {
              // A basket error should not prevent the
              // sign up verification from completing, nor
              // should an error be displayed to the user.
              // Log the error and nothing else.
              self.logError(err);
            } else {
              throw err;
            }
          })
          .then(function () {
            self.logViewEvent('verification.success');
            self.notifier.trigger('verification.success');

            // Update the stored account data in case it was
            // updated by verifySignUp.
            var account = self.getAccount();
            self.user.setAccount(account);
            return self.invokeBrokerMethod('afterCompleteSignUp', account);
          })
          .then(function () {
            var account = self.getAccount();

            if (! self.relier.isDirectAccess()) {
              self._navigateToCompleteScreen();
              return false;
            }

            return account.isSignedIn()
              .then(function (isSignedIn) {
                if (isSignedIn) {
                  self.navigate('settings', {
                    success: t('Account verified successfully')
                  });
                } else {
                  self._navigateToCompleteScreen();
                }
                return false;
              });
          })
          .fail(function (err) {
            if (AuthErrors.is(err, 'UNKNOWN_ACCOUNT')) {
              verificationInfo.markExpired();
              err = AuthErrors.toError('EXPIRED_VERIFICATION_LINK');
            } else if (
                AuthErrors.is(err, 'INVALID_VERIFICATION_CODE') ||
                AuthErrors.is(err, 'INVALID_PARAMETER')) {
              // These server says the verification code or any parameter is
              // invalid. The entire link is damaged.
              verificationInfo.markDamaged();
              err = AuthErrors.toError('DAMAGED_VERIFICATION_LINK');
            } else {
              // all other errors show the standard error box.
              self._error = self.translateError(err);
            }

            self.logError(err);
            return true;
          });
    },

    context: function () {
      var verificationInfo = this._verificationInfo;
      return {
        // This is only the case if you've signed up in the
        // same browser you opened the verification link in.
        canResend: this._canResend(),
        error: this._error,
        // If the link is invalid, print a special error message.
        isLinkDamaged: ! verificationInfo.isValid(),
        isLinkExpired: verificationInfo.isExpired()
      };
    },

    _canResend: function () {
      return !! this._getResendSessionToken();
    },

    // This returns the latest sessionToken associated with the user's email
    // address. We intentionally don't cache it during view initialization so that
    // we can capture sessionTokens from accounts created (in this browser)
    // since the view was loaded.
    _getResendSessionToken: function () {
      return this.user.getAccountByEmail(this._email).get('sessionToken');
    },

    // This is called when a user follows an expired verification link
    // and clicks the "Resend" link.
    submit: function () {
      var self = this;

      self.logViewEvent('resend');

      var account = this.user.getAccountByEmail(this._email);
      return account.retrySignUp(
        self.relier,
        {
          resume: self.getStringifiedResumeToken()
        }
      )
      .then(function () {
        self.displaySuccess();
      })
      .fail(function (err) {
        if (AuthErrors.is(err, 'INVALID_TOKEN')) {
          return self.navigate('signup', {
            error: err
          });
        }

        // unexpected error, rethrow for display.
        throw err;
      });
    },

    // The ResendMixin overrides beforeSubmit. Unless set to undefined,
    // Cocktail runs both the original version and the overridden version.
    beforeSubmit: undefined
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
