/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const AuthErrors = require('lib/auth-errors');
  const BackMixin = require('views/mixins/back-mixin');
  const BaseView = require('views/base');
  const Cocktail = require('cocktail');
  const Constants = require('lib/constants');
  const ExperimentMixin = require('views/mixins/experiment-mixin');
  const OpenConfirmationEmailMixin = require('views/mixins/open-webmail-mixin');
  const p = require('lib/promise');
  const ResendMixin = require('views/mixins/resend-mixin');
  const ResumeTokenMixin = require('views/mixins/resume-token-mixin');
  const ServiceMixin = require('views/mixins/service-mixin');
  const Template = require('stache!templates/confirm');
  const VerificationReasonMixin = require('views/mixins/verification-reason-mixin');

  const t = BaseView.t;

  const proto = BaseView.prototype;
  const View = BaseView.extend({
    template: Template,
    className: 'confirm',

    // used by unit tests
    VERIFICATION_POLL_IN_MS: Constants.VERIFICATION_POLL_IN_MS,

    initialize () {
      // Account data is passed in from sign up and sign in flows.
      // It's important for Sync flows where account data holds
      // ephemeral properties like unwrapBKey and keyFetchToken
      // that need to be sent to the browser.
      this._account = this.user.initAccount(this.model.get('account'));
      this.flow = this.model.get('flow');
    },

    getAccount () {
      return this._account;
    },

    context () {
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
        email,
        escapedEmail: _.escape(email),
        isSignIn,
        isSignUp
      };
    },

    _bouncedEmailSignup () {
      this.navigate('signup', {
        bouncedEmail: this.getAccount().get('email')
      });
    },

    _getMissingSessionTokenScreen () {
      var screenUrl = this.isSignUp() ? 'signup' : 'signin';
      return this.broker.transformLink(screenUrl);
    },

    _navigateToConfirmedScreen () {
      if (this.isSignUp()) {
        this.navigate('signup_confirmed');
      } else {
        this.navigate('signin_confirmed');
      }
    },

    beforeRender () {
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
      return this._waitForConfirmation()
        .then(() => {
          this.logViewEvent('verification.success');
          this.notifier.trigger('verification.success');

          var brokerMethod =
            this.isSignUp() ?
            'afterSignUpConfirmationPoll' :
            'afterSignInConfirmationPoll';

          return this.invokeBrokerMethod(brokerMethod, this.getAccount());
        })
        .then(() => {
          // the user is definitely authenticated here.
          if (this.relier.isDirectAccess()) {
            this.navigate('settings', {
              success: t('Account verified successfully')
            });
          } else {
            return this._navigateToConfirmedScreen();
          }
        })
        .fail((err) => {
          // The user's email may have bounced because it was invalid.
          // Redirect them to the sign up page with an error notice.
          if (AuthErrors.is(err, 'SIGNUP_EMAIL_BOUNCE')) {
            this._bouncedEmailSignup();
          } else if (AuthErrors.is(err, 'UNEXPECTED_ERROR')) {
            // Hide the error from the user if it is an unexpected error.
            // an error may happen here if the status api is overloaded or
            // if the user is switching networks.
            // Report a known error to Sentry, but not the user.
            // Details: github.com/mozilla/fxa-content-server/issues/2638.
            this.logError(AuthErrors.toError('POLLING_FAILED'));
            var deferred = p.defer();

            this.setTimeout(() => {
              deferred.resolve(this._startPolling());
            }, this.VERIFICATION_POLL_IN_MS);

            return deferred.promise;
          } else {
            this.displayError(err);
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
      const account = this.getAccount();
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
