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
  var ExperimentMixin = require('views/mixins/experiment-mixin');
  var OpenConfirmationEmailMixin = require('views/mixins/open-webmail-mixin');
  var p = require('lib/promise');
  var ResendMixin = require('views/mixins/resend-mixin');
  var ResumeTokenMixin = require('views/mixins/resume-token-mixin');
  var ServiceMixin = require('views/mixins/service-mixin');
  var Template = require('stache!templates/confirm');
  var VerificationReasonMixin = require('views/mixins/verification-reason-mixin');

  var t = BaseView.t;

  const proto = BaseView.prototype;
  const View = BaseView.extend({
    template: Template,
    className: 'confirm',

    // used by unit tests
    VERIFICATION_POLL_IN_MS: Constants.VERIFICATION_POLL_IN_MS,

    initialize: function () {
      // Account data is passed in from sign up and sign in flows.
      // It's important for Sync flows where account data holds
      // ephemeral properties like unwrapBKey and keyFetchToken
      // that need to be sent to the browser.
      this._account = this.user.initAccount(this.model.get('account'));
      this.flow = this.model.get('flow');
    },

    getAccount: function () {
      return this._account;
    },

    context: function () {
      var email = this.getAccount().get('email');
      var isSignIn = this.isSignIn();
      var isSignUp = this.isSignUp();

      return {
        // Back button is only available for signin for now. We haven't fully
        // figured out whether re-signing up a user and sending a new
        // email/sessionToken to the browser will cause problems. I don't think
        // it will since that's what happens on a bounced email, but that's
        // a discussion for another time.
        canGoBack: isSignIn && this.canGoBack(),
        email: email,
        isSignIn: isSignIn,
        isSignUp: isSignUp
      };
    },

    _bouncedEmailSignup: function () {
      this.navigate('signup', {
        bouncedEmail: this.getAccount().get('email')
      });
    },

    _getMissingSessionTokenScreen: function () {
      var screenUrl = this.isSignUp() ? 'signup' : 'signin';
      return this.broker.transformLink(screenUrl);
    },

    _navigateToCompleteScreen: function () {
      if (this.isSignUp()) {
        this.navigate('signup_complete');
      } else {
        this.navigate('signin_complete');
      }
    },

    beforeRender: function () {
      // user cannot confirm if they have not initiated a sign up.
      if (! this.getAccount().get('sessionToken')) {
        this.navigate(this._getMissingSessionTokenScreen());
        return false;
      }
    },

    afterRender () {
      var graphic = this.$el.find('.graphic');
      graphic.addClass('pulse');

      this.transformLinks();
      return proto.afterRender.call(this);
    },

    afterVisible () {
      // the view is always rendered, but the confirmation poll may be
      // prevented by the broker. An example is Firefox Desktop where the
      // browser is already performing a poll, so a second poll is not needed.
      const account = this.getAccount();
      return proto.afterVisible.call(this)
        .then(() => this.broker.persistVerificationData(account))
        .then(() =>
          this.invokeBrokerMethod('beforeSignUpConfirmationPoll', account)
        )
        .then(() => this._startPolling());
    },

    _startPolling () {
      var self = this;

      return self._waitForConfirmation()
        .then(function () {
          self.logViewEvent('verification.success');
          self.notifier.trigger('verification.success');

          var brokerMethod =
            self.isSignUp() ?
            'afterSignUpConfirmationPoll' :
            'afterSignInConfirmationPoll';

          return self.invokeBrokerMethod(brokerMethod, self.getAccount());
        })
        .then(function () {
          // the user is definitely authenticated here.
          if (self.relier.isDirectAccess()) {
            self.navigate('settings', {
              success: t('Account verified successfully')
            });
          } else {
            return self._navigateToCompleteScreen();
          }
        })
        .fail(function (err) {
          // The user's email may have bounced because it was invalid.
          // Redirect them to the sign up page with an error notice.
          if (AuthErrors.is(err, 'SIGNUP_EMAIL_BOUNCE')) {
            self._bouncedEmailSignup();
          } else if (AuthErrors.is(err, 'UNEXPECTED_ERROR')) {
            // Hide the error from the user if it is an unexpected error.
            // an error may happen here if the status api is overloaded or
            // if the user is switching networks.
            // Report a known error to Sentry, but not the user.
            // Details: github.com/mozilla/fxa-content-server/issues/2638.
            self.logError(AuthErrors.toError('POLLING_FAILED'));
            var deferred = p.defer();

            self.setTimeout(function () {
              deferred.resolve(self._startPolling());
            }, self.VERIFICATION_POLL_IN_MS);

            return deferred.promise;
          } else {
            self.displayError(err);
          }
        });
    },

    _waitForConfirmation () {
      const account = this.getAccount();
      return account.waitForSessionVerification(this.VERIFICATION_POLL_IN_MS)
        .then(() => {
          this.user.setAccount(account);
        });
    },

    resend () {
      return this.getAccount().retrySignUp(
        this.relier,
        {
          resume: this.getStringifiedResumeToken()
        }
      )
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
    View,
    BackMixin,
    ExperimentMixin,
    OpenConfirmationEmailMixin,
    ResendMixin,
    ResumeTokenMixin,
    ServiceMixin,
    VerificationReasonMixin
  );

  module.exports = View;
});
