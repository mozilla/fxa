/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const AuthErrors = require('../lib/auth-errors');
  const BackMixin = require('./mixins/back-mixin');
  const BaseView = require('./base');
  const Cocktail = require('cocktail');
  const ConnectAnotherDeviceMixin = require('./mixins/connect-another-device-mixin');
  const OpenConfirmationEmailMixin = require('./mixins/open-webmail-mixin');
  const PulseGraphicMixin = require('./mixins/pulse-graphic-mixin');
  const ResendMixin = require('./mixins/resend-mixin')();
  const ResumeTokenMixin = require('./mixins/resume-token-mixin');
  const ServiceMixin = require('./mixins/service-mixin');
  const SessionVerificationPollMixin = require('./mixins/session-verification-poll-mixin');
  const Template = require('stache!templates/confirm');

  const proto = BaseView.prototype;
  const View = BaseView.extend({
    template: Template,
    className: 'confirm',

    initialize (options = {}) {
      // Account data is passed in from sign up and sign in flows.
      // It's important for Sync flows where account data holds
      // ephemeral properties like unwrapBKey and keyFetchToken
      // that need to be sent to the browser.
      this._account = this.user.initAccount(this.model.get('account'));
    },

    getAccount () {
      return this._account;
    },

    setInitialContext (context) {
      var email = this.getAccount().get('email');
      var isSignIn = this.isSignIn();
      var isSignUp = this.isSignUp();

      context.set({
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
      });
    },

    _getMissingSessionTokenScreen () {
      var screenUrl = this.isSignUp() ? 'signup' : 'signin';
      return this.broker.transformLink(screenUrl);
    },

    beforeRender () {
      // user cannot confirm if they have not initiated a sign up.
      if (! this.getAccount().get('sessionToken')) {
        this.navigate(this._getMissingSessionTokenScreen());
      }
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
        .then(() =>
          this.waitForSessionVerification(account, () => this._gotoNextScreen())
        );
    },

    _gotoNextScreen () {
      const account = this.getAccount();
      return this.user.setAccount(account)
        .then(() => {
          this.logViewEvent('verification.success');
          this.notifier.trigger('verification.success');

          var brokerMethod =
            this.isSignUp() ?
            'afterSignUpConfirmationPoll' :
            'afterSignInConfirmationPoll';

          return this.invokeBrokerMethod(brokerMethod, account);
        });
    },

    resend () {
      const account = this.getAccount();
      return account.retrySignUp(this.relier, {
        resume: this.getStringifiedResumeToken(account)
      })
      .catch((err) => {
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
    ConnectAnotherDeviceMixin,
    OpenConfirmationEmailMixin,
    PulseGraphicMixin,
    ResendMixin,
    ResumeTokenMixin,
    ServiceMixin,
    SessionVerificationPollMixin
  );

  module.exports = View;
});
