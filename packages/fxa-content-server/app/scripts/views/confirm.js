/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import _ from 'underscore';
import AuthErrors from '../lib/auth-errors';
import BackMixin from './mixins/back-mixin';
import FormView from './form';
import Cocktail from 'cocktail';
import ConnectAnotherDeviceMixin from './mixins/connect-another-device-mixin';
import OpenConfirmationEmailMixin from './mixins/open-webmail-mixin';
import PulseGraphicMixin from './mixins/pulse-graphic-mixin';
import ResendMixin from './mixins/resend-mixin';
import ResumeTokenMixin from './mixins/resume-token-mixin';
import ServiceMixin from './mixins/service-mixin';
import SessionVerificationPollMixin from './mixins/session-verification-poll-mixin';
import Template from 'templates/confirm.mustache';

import VerificationMethods from '../lib/verification-methods';

const proto = FormView.prototype;
const View = FormView.extend({
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
      mustEnterCode: this._mustEnterSignupCode(),
    });
  },

  _mustEnterSignupCode() {
    const account = this.getAccount();
    return account.get('verificationMethod') === VerificationMethods.EMAIL_2FA;
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

    if (!this._mustEnterSignupCode()) {
      // No need to poll if the user has to enter a code, we'll know
      // once the account is verified via the submit handler.
      return;
    }

    return proto.afterVisible.call(this).then(() => {
      if (this._mustEnterSignupCode()) {
        // No need to poll if the user has to enter a code, we'll know
        // once the account is verified via the submit handler.
        return;
      }

      return this.broker
        .persistVerificationData(account)
        .then(() =>
          this.invokeBrokerMethod('beforeSignUpConfirmationPoll', account)
        )
        .then(() =>
          this.waitForSessionVerification(account, () => this._gotoNextScreen())
        );
    });
  },

  _gotoNextScreen() {
    const account = this.getAccount();
    return this.user.setAccount(account).then(() => {
      this.logViewEvent('verification.success');
      this.notifier.trigger('verification.success');

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

  submit() {
    // TODO - do some input validation on the signupCode to avoid
    // hitting the backend.

    const signupCodeSelector = '[name="signupCode"]';
    const signupCode = this.getElementValue(signupCodeSelector);
    console.log('signup code', signupCode);
    return this.user
      .completeAccountSignUp(
        this.getAccount(),
        signupCode,
        this.relier.pick('service')
      )
      .then(
        () => {
          return this._gotoNextScreen();
        },
        err => {
          if (AuthErrors.is(err, 'INVALID_VERIFICATION_CODE')) {
            return this.showValidationError(signupCodeSelector, err);
          }
          // All other errors show as an error bar at the top
          throw err;
        }
      );
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
  ServiceMixin,
  SessionVerificationPollMixin
);

export default View;
