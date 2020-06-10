/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import _ from 'underscore';
import AuthErrors from '../lib/auth-errors';
import BackMixin from './mixins/back-mixin';
import BaseView from './base';
import Cocktail from 'cocktail';
import ConnectAnotherDeviceMixin from './mixins/connect-another-device-mixin';
import OpenConfirmationEmailMixin from './mixins/open-webmail-mixin';
import PulseGraphicMixin from './mixins/pulse-graphic-mixin';
import ResendMixin from './mixins/resend-mixin';
import ResumeTokenMixin from './mixins/resume-token-mixin';
import ServiceMixin from './mixins/service-mixin';
import SessionVerificationPollMixin from './mixins/session-verification-poll-mixin';
import VerificationReasonMixin from './mixins/verification-reason-mixin';
import Template from 'templates/confirm.mustache';

const proto = BaseView.prototype;
const View = BaseView.extend({
  template: Template,
  className: 'confirm',

  initialize(options = {}) {
    // Account data is passed in from sign up and sign in flows.
    // It's important for Sync flows where account data holds
    // ephemeral properties like unwrapBKey and keyFetchToken
    // that need to be sent to the browser.
    this._account = this.user.initAccount(this.model.get('account'));
  },

  getAccount() {
    return this._account;
  },

  setInitialContext(context) {
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
      escapedEmail: `<span class="email">${_.escape(email)}</span>`,
      isSignIn,
      isSignUp,
    });
  },

  _getMissingSessionTokenScreen() {
    return this.isSignUp() ? 'signup' : 'signin';
  },

  beforeRender() {
    // user cannot confirm if they have not initiated a sign up.
    if (!this.getAccount().get('sessionToken')) {
      this.navigate(this._getMissingSessionTokenScreen());
    }
  },

  afterVisible() {
    // the view is always rendered, but the confirmation poll may be
    // prevented by the broker. An example is Firefox Desktop where the
    // browser is already performing a poll, so a second poll is not needed.
    const account = this.getAccount();
    return proto.afterVisible
      .call(this)
      .then(() => this.broker.persistVerificationData(account))
      .then(() =>
        this.invokeBrokerMethod('beforeSignUpConfirmationPoll', account)
      )
      .then(() =>
        this.waitForSessionVerification(account, () => this._gotoNextScreen())
      );
  },

  _gotoNextScreen() {
    return Promise.resolve().then(() => {
      const account = this.getAccount();
      this.logViewEvent('verification.success');
      this.notifier.trigger('verification.success');

      if (this.isForcePasswordChange(account)) {
        return this.navigate('/post_verify/password/force_password_change', {
          account,
        });
      }

      var brokerMethod = this.isSignUp()
        ? 'afterSignUpConfirmationPoll'
        : 'afterSignInConfirmationPoll';

      return this.invokeBrokerMethod(brokerMethod, account);
    });
  },

  resend() {
    const account = this.getAccount();
    return account
      .retrySignUp(this.relier, {
        resume: this.getStringifiedResumeToken(account),
      })
      .catch((err) => {
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
  View,
  BackMixin,
  ConnectAnotherDeviceMixin,
  OpenConfirmationEmailMixin,
  PulseGraphicMixin,
  ResendMixin(),
  ResumeTokenMixin,
  VerificationReasonMixin,
  ServiceMixin,
  SessionVerificationPollMixin
);

export default View;
