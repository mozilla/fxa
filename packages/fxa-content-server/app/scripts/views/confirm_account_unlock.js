/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var AuthErrors = require('lib/auth-errors');
  var BackMixin = require('views/mixins/back-mixin');
  var BaseView = require('views/base');
  var Cocktail = require('cocktail');
  var Constants = require('lib/constants');
  var FormView = require('views/form');
  var p = require('lib/promise');
  var ResendMixin = require('views/mixins/resend-mixin');
  var ResumeTokenMixin = require('views/mixins/resume-token-mixin');
  var ServiceMixin = require('views/mixins/service-mixin');
  var Template = require('stache!templates/confirm_account_unlock');

  var t = BaseView.t;

  function isLockoutSourceSignIn(lockoutSource) {
    return lockoutSource === 'signin' ||
           lockoutSource === 'oauth.signin';
  }

  var View = FormView.extend({
    template: Template,
    className: 'confirm_account_unlock',

    // used by unit tests
    VERIFICATION_POLL_IN_MS: Constants.VERIFICATION_POLL_IN_MS,

    initialize: function () {
      var data = this.ephemeralData();
      var accountData;

      if (data) {
        if (data.lockoutSource) {
          this._lockoutSource = data.lockoutSource;
        }

        if (data.account) {
          accountData = data.account;
        }
      }

      this._account = this.user.initAccount(accountData);
    },

    getAccount: function () {
      return this._account;
    },

    context: function () {
      return {
        email: this.getAccount().get('email')
      };
    },

    events: {
      // validateAndSubmit is used to prevent multiple concurrent submissions.
      'click #resend': BaseView.preventDefaultThen('validateAndSubmit')

    },

    beforeRender: function () {
      // browsing directly to the page should not be allowed.
      var self = this;
      return p().then(function () {
        if (self.getAccount().isDefault()) {
          self.navigate('signup');
          return false;
        }
      });
    },

    afterVisible: function () {
      var self = this;
      return self.broker.persistVerificationData(self.getAccount())
        .then(function () {
          return self._waitForConfirmation();
        })
        .then(function (updatedSessionData) {
          self.getAccount().set(updatedSessionData);
          self.logViewEvent('verification.success');

          // the continuation path depends on the action that triggered
          // the account lockout notice. The only time the broker should
          // be notified is if the user was trying to sign in.
          if (isLockoutSourceSignIn(self._lockoutSource)) {
            return self.invokeBrokerMethod('afterSignIn', self.getAccount())
              .then(function () {
                self.navigate('account_unlock_complete');
              });
          }

          // return non-signin users back to where they came from.
          self.ephemeralMessages.set(
              'success', t('Account unlocked, please try again'));
          self.back();
        })
        .fail(function (err) {
          if (AuthErrors.is(err, 'INCORRECT_PASSWORD')) {
            // Whether the account is locked is checked before the password.
            // If the error is INCORRECT_PASSWORD, we know the account is
            // unlocked, but the user typed in their password incorrectly.
            // Boot the user back to where they came from to let them re-enter
            // their password.
            self.ephemeralMessages.set('error', err);
            self.back();
            return;
          }
          self.displayError(err);
        });
    },

    _waitForConfirmation: function () {
      var self = this;
      var account = self.getAccount();
      var email = account.get('email');
      var password = account.get('password');

      // try to sign the user in using the email/password that caused the
      // account to be locked. If the user has verified their email address,
      // the sign in will successfully complete. If they have not verified
      // their address, the sign in call will fail with the ACCOUNT_LOCKED
      // error, and we poll again.
      return self.fxaClient.signIn(
          email,
          password,
          self.relier,
          { reason: self.fxaClient.SIGNIN_REASON.ACCOUNT_UNLOCK }
        )
        .fail(function (err) {
          if (AuthErrors.is(err, 'ACCOUNT_LOCKED')) {
            // user has not yet verified, poll again.
            var deferred = p.defer();

            // _waitForConfirmation will return a promise and the
            // promise chain remains unbroken.
            self.setTimeout(function () {
              deferred.resolve(self._waitForConfirmation());
            }, self.VERIFICATION_POLL_IN_MS);

            return deferred.promise;
          }

          // re-throw other errors to be handled at a higher level.
          throw err;
        });
    },

    submit: function () {
      var self = this;

      self.logViewEvent('resend');
      var email = self.getAccount().get('email');
      return self.fxaClient.sendAccountUnlockEmail(email, self.relier, {
        resume: self.getStringifiedResumeToken()
      })
      .then(function () {
        self.logViewEvent('resend.success');
        self.displaySuccess();
      });
    }
  });

  Cocktail.mixin(
    View,
    BackMixin,
    ResendMixin,
    ResumeTokenMixin,
    ServiceMixin
  );

  module.exports = View;
});
